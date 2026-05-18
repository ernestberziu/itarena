import { db } from "@/lib/db";
import { canAccessProject, listAccessibleProjectIds } from "@/lib/projects/access";

/** Ensures the canonical PROJECT conversation exists and participants are synced. */
export async function ensureProjectConversation(projectId: string, createdById: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      title: true,
      createdById: true,
      members: { select: { userId: true } },
      clients: { select: { userId: true } },
    },
  });
  if (!project) return null;

  const participantIds = new Set<string>([project.createdById]);
  for (const m of project.members) participantIds.add(m.userId);
  for (const c of project.clients) {
    if (c.userId) participantIds.add(c.userId);
  }
  if (await canAccessProject(createdById, projectId, "read")) {
    participantIds.add(createdById);
  }

  let conversation = await db.conversation.findUnique({
    where: { projectId },
    select: { id: true },
  });

  if (!conversation) {
    conversation = await db.conversation.create({
      data: {
        type: "PROJECT",
        title: project.title,
        projectId,
        createdById: project.createdById,
        participants: {
          create: [...participantIds].map((userId) => ({
            userId,
            role: userId === project.createdById ? "admin" : "member",
          })),
        },
      },
      select: { id: true },
    });
    return conversation;
  }

  const existing = await db.conversationParticipant.findMany({
    where: { conversationId: conversation.id },
    select: { userId: true },
  });
  const existingSet = new Set(existing.map((p) => p.userId));
  const toAdd = [...participantIds].filter((id) => !existingSet.has(id));
  if (toAdd.length > 0) {
    await db.conversationParticipant.createMany({
      data: toAdd.map((userId) => ({
        conversationId: conversation!.id,
        userId,
        role: "member",
      })),
      skipDuplicates: true,
    });
  }

  return conversation;
}

/** Create/sync project channels for every project the user can access (for global inbox). */
export async function syncAccessibleProjectChannels(userId: string) {
  const accessibleIds = await listAccessibleProjectIds(userId);

  const projects =
    accessibleIds === null
      ? await db.project.findMany({
          select: { id: true, createdById: true },
          orderBy: { updatedAt: "desc" },
        })
      : accessibleIds.length === 0
        ? []
        : await db.project.findMany({
            where: { id: { in: accessibleIds } },
            select: { id: true, createdById: true },
            orderBy: { updatedAt: "desc" },
          });

  for (const project of projects) {
    await ensureProjectConversation(project.id, userId);
  }
}

/** Backfill PROJECT conversations and migrate legacy project_messages. */
export async function backfillProjectConversations() {
  const projects = await db.project.findMany({
    select: { id: true, createdById: true },
  });

  for (const p of projects) {
    const conv = await ensureProjectConversation(p.id, p.createdById);
    if (!conv) continue;

    const legacy = await db.projectMessage.findMany({
      where: { projectId: p.id },
    });

    for (const pm of legacy) {
      const exists = await db.conversationMessage.findUnique({ where: { id: pm.id } });
      if (exists) continue;
      await db.conversationMessage.create({
        data: {
          id: pm.id,
          conversationId: conv.id,
          authorId: pm.authorId,
          body: pm.body,
          isInternal: pm.isInternal,
          attachments: pm.attachments,
          createdAt: pm.createdAt,
          updatedAt: pm.updatedAt,
        },
      });
    }

    const last = await db.conversationMessage.findFirst({
      where: { conversationId: conv.id },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    if (last) {
      await db.conversation.update({
        where: { id: conv.id },
        data: { lastMessageAt: last.createdAt },
      });
    }
  }
}
