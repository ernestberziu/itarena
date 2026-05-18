import type { Role } from "@/types/domain";
import type { ConversationDetail, ConversationListRow, ConversationMessageRow } from "./types";
import { isStaffRole } from "./access";

type ParticipantUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

export function conversationDisplayTitle(
  type: string,
  title: string | null,
  projectTitle: string | null,
  participants: ParticipantUser[],
  currentUserId: string,
  locale: "sq" | "en"
): string {
  if (type === "PROJECT") {
    return projectTitle ?? title ?? (locale === "sq" ? "Kanali i projektit" : "Project channel");
  }
  if (title?.trim()) return title.trim();
  if (type === "DIRECT") {
    const other = participants.find((p) => p.id !== currentUserId);
    if (other) return `${other.firstName} ${other.lastName}`.trim();
  }
  if (type === "GROUP") {
    const names = participants
      .filter((p) => p.id !== currentUserId)
      .slice(0, 3)
      .map((p) => p.firstName)
      .join(", ");
    return names || (locale === "sq" ? "Grup" : "Group");
  }
  return locale === "sq" ? "Bisedë" : "Conversation";
}

export function toMessageRow(
  m: {
    id: string;
    body: string;
    isInternal: boolean;
    createdAt: Date;
    author: { id: string; firstName: string; lastName: string; role: string };
  }
): ConversationMessageRow {
  return {
    id: m.id,
    body: m.body,
    isInternal: m.isInternal,
    createdAt: m.createdAt.toISOString(),
    author: {
      id: m.author.id,
      firstName: m.author.firstName,
      lastName: m.author.lastName,
      role: m.author.role as Role,
    },
  };
}

export function filterMessagesForViewer<T extends { isInternal: boolean }>(
  messages: T[],
  viewerRole: Role
): T[] {
  if (isStaffRole(viewerRole)) return messages;
  return messages.filter((m) => !m.isInternal);
}

export function toConversationListRow(
  c: {
    id: string;
    type: string;
    title: string | null;
    projectId: string | null;
    lastMessageAt: Date | null;
    createdAt: Date;
    project: { title: string } | null;
    participants: Array<{
      user: ParticipantUser;
    }>;
    messages: Array<{
      body: string;
      isInternal: boolean;
      createdAt: Date;
      author: { firstName: string; lastName: string };
    }>;
  },
  currentUserId: string,
  locale: "sq" | "en",
  unreadCount: number
): ConversationListRow {
  const users = c.participants.map((p) => p.user);
  const last = c.messages[0];
  return {
    id: c.id,
    type: c.type as ConversationListRow["type"],
    title: c.title,
    projectId: c.projectId,
    lastMessageAt: c.lastMessageAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
    unreadCount,
    lastMessage: last
      ? {
          body: last.body.slice(0, 120),
          authorName: `${last.author.firstName} ${last.author.lastName}`,
          isInternal: last.isInternal,
          createdAt: last.createdAt.toISOString(),
        }
      : null,
    participants: users.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role as Role,
    })),
    displayTitle: conversationDisplayTitle(
      c.type,
      c.title,
      c.project?.title ?? null,
      users,
      currentUserId,
      locale
    ),
  };
}

export function toConversationDetail(
  c: {
    id: string;
    type: string;
    title: string | null;
    projectId: string | null;
    createdById: string;
    lastMessageAt: Date | null;
    project: { title: string } | null;
    participants: Array<{
      userId: string;
      role: string;
      lastReadAt: Date | null;
      user: ParticipantUser;
    }>;
  },
  currentUserId: string,
  locale: "sq" | "en"
): ConversationDetail {
  const users = c.participants.map((p) => p.user);
  return {
    id: c.id,
    type: c.type as ConversationDetail["type"],
    title: c.title,
    projectId: c.projectId,
    createdById: c.createdById,
    lastMessageAt: c.lastMessageAt?.toISOString() ?? null,
    participants: c.participants.map((p) => ({
      id: p.user.id,
      userId: p.userId,
      participantRole: p.role,
      firstName: p.user.firstName,
      lastName: p.user.lastName,
      email: p.user.email,
      role: p.user.role as Role,
      lastReadAt: p.lastReadAt?.toISOString() ?? null,
    })),
    displayTitle: conversationDisplayTitle(
      c.type,
      c.title,
      c.project?.title ?? null,
      users,
      currentUserId,
      locale
    ),
  };
}
