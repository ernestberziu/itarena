import { db } from "@/lib/db";
import { canMessageUser } from "./access";

const conversationInclude = {
  project: { select: { title: true } },
  participants: {
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true, role: true },
      },
    },
  },
} as const;

export async function findDirectConversation(
  userId: string,
  otherUserId: string
): Promise<string | null> {
  const conversations = await db.conversation.findMany({
    where: {
      type: "DIRECT",
      AND: [
        { participants: { some: { userId } } },
        { participants: { some: { userId: otherUserId } } },
      ],
    },
    select: {
      id: true,
      participants: { select: { userId: true } },
    },
  });
  const match = conversations.find((c) => {
    const ids = c.participants.map((p) => p.userId).sort().join(",");
    const expected = [userId, otherUserId].sort().join(",");
    return c.participants.length === 2 && ids === expected;
  });
  return match?.id ?? null;
}

export async function createDirectConversation(
  creatorId: string,
  otherUserId: string
): Promise<{ id: string }> {
  const existing = await findDirectConversation(creatorId, otherUserId);
  if (existing) return { id: existing };

  const can = await canMessageUser(creatorId, otherUserId);
  if (!can) throw new Error("CANNOT_MESSAGE_USER");

  const conv = await db.conversation.create({
    data: {
      type: "DIRECT",
      createdById: creatorId,
      participants: {
        create: [
          { userId: creatorId, role: "admin" },
          { userId: otherUserId, role: "member" },
        ],
      },
    },
    select: { id: true },
  });
  return conv;
}

export async function createGroupConversation(
  creatorId: string,
  title: string,
  participantIds: string[]
): Promise<{ id: string }> {
  const unique = [...new Set(participantIds.filter((id) => id !== creatorId))];
  for (const id of unique) {
    const can = await canMessageUser(creatorId, id);
    if (!can) throw new Error("CANNOT_MESSAGE_USER");
  }

  const conv = await db.conversation.create({
    data: {
      type: "GROUP",
      title: title.trim(),
      createdById: creatorId,
      participants: {
        create: [
          { userId: creatorId, role: "admin" },
          ...unique.map((userId) => ({ userId, role: "member" as const })),
        ],
      },
    },
    select: { id: true },
  });
  return conv;
}

export async function getConversationDetail(conversationId: string) {
  return db.conversation.findUnique({
    where: { id: conversationId },
    include: conversationInclude,
  });
}

export async function listUserConversations(
  userId: string,
  filters: {
    projectId?: string;
    type?: string;
    excludeType?: string;
    q?: string;
    skip: number;
    take: number;
  }
) {
  const where = {
    participants: { some: { userId } },
    ...(filters.projectId ? { projectId: filters.projectId } : {}),
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.excludeType ? { type: { not: filters.excludeType } } : {}),
    ...(filters.q?.trim()
      ? {
          OR: [
            { title: { contains: filters.q.trim(), mode: "insensitive" as const } },
            {
              participants: {
                some: {
                  user: {
                    OR: [
                      { firstName: { contains: filters.q.trim(), mode: "insensitive" as const } },
                      { lastName: { contains: filters.q.trim(), mode: "insensitive" as const } },
                      { email: { contains: filters.q.trim(), mode: "insensitive" as const } },
                    ],
                  },
                },
              },
            },
            {
              project: {
                title: { contains: filters.q.trim(), mode: "insensitive" as const },
              },
            },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.conversation.findMany({
      where,
      orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
      skip: filters.skip,
      take: filters.take,
      include: {
        ...conversationInclude,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 20,
          where: { isInternal: false },
          include: {
            author: { select: { firstName: true, lastName: true, role: true } },
          },
        },
      },
    }),
    db.conversation.count({ where }),
  ]);

  const unreadCounts = await Promise.all(
    items.map(async (c) => {
      const part = await db.conversationParticipant.findUnique({
        where: { conversationId_userId: { conversationId: c.id, userId } },
        select: { lastReadAt: true },
      });
      const since = part?.lastReadAt ?? new Date(0);
      return db.conversationMessage.count({
        where: {
          conversationId: c.id,
          createdAt: { gt: since },
          NOT: { authorId: userId },
        },
      });
    })
  );

  return { items, total, unreadCounts };
}

function mergeConversationsByRecency(
  a: Awaited<ReturnType<typeof listUserConversations>>["items"],
  b: Awaited<ReturnType<typeof listUserConversations>>["items"]
) {
  const seen = new Set<string>();
  const merged: typeof a = [];
  for (const c of [...a, ...b]) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    merged.push(c);
  }
  merged.sort((x, y) => {
    const xAt = x.lastMessageAt?.getTime() ?? x.updatedAt.getTime();
    const yAt = y.lastMessageAt?.getTime() ?? y.updatedAt.getTime();
    return yAt - xAt;
  });
  return merged;
}

/** Inbox list: when unfiltered, always include project channels (not crowded out by DMs). */
export async function listInboxConversations(
  userId: string,
  filters: {
    projectId?: string;
    type?: string;
    q?: string;
    skip: number;
    take: number;
  }
) {
  if (filters.projectId || filters.type) {
    return listUserConversations(userId, filters);
  }

  const [projectResult, otherResult] = await Promise.all([
    listUserConversations(userId, {
      type: "PROJECT",
      q: filters.q,
      skip: 0,
      take: 100,
    }),
    listUserConversations(userId, {
      excludeType: "PROJECT",
      q: filters.q,
      skip: filters.skip,
      take: filters.take,
    }),
  ]);

  const merged = mergeConversationsByRecency(projectResult.items, otherResult.items);
  const page = merged.slice(filters.skip, filters.skip + filters.take);

  const unreadCounts = await Promise.all(
    page.map(async (c) => {
      const part = await db.conversationParticipant.findUnique({
        where: { conversationId_userId: { conversationId: c.id, userId } },
        select: { lastReadAt: true },
      });
      const since = part?.lastReadAt ?? new Date(0);
      return db.conversationMessage.count({
        where: {
          conversationId: c.id,
          createdAt: { gt: since },
          NOT: { authorId: userId },
        },
      });
    })
  );

  return {
    items: page,
    total: projectResult.total + otherResult.total,
    unreadCounts,
  };
}
