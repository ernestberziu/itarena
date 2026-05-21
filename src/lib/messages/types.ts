import type { Role } from "@/types/domain";

export const CONVERSATION_TYPES = ["PROJECT", "DIRECT", "GROUP"] as const;
export type ConversationType = (typeof CONVERSATION_TYPES)[number];

export type ConversationListRow = {
  id: string;
  type: ConversationType;
  title: string | null;
  projectId: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  unreadCount: number;
  lastMessage: {
    body: string;
    authorName: string;
    isInternal: boolean;
    createdAt: string;
  } | null;
  participants: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    role: Role;
  }>;
  displayTitle: string;
};

export type ConversationDetail = {
  id: string;
  type: ConversationType;
  title: string | null;
  projectId: string | null;
  createdById: string;
  lastMessageAt: string | null;
  participants: Array<{
    id: string;
    userId: string;
    participantRole: string;
    firstName: string;
    lastName: string;
    email: string | null;
    role: Role;
    lastReadAt: string | null;
  }>;
  displayTitle: string;
};

export type ConversationMessageRow = {
  id: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
  guestAuthorName?: string | null;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    role: Role;
  } | null;
};
