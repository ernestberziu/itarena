import { PORTAL_BRAND_NAME } from "@/lib/portal/client-branding";
import { isStaffRole } from "./access";
import type { ConversationDetail, ConversationListRow, ConversationMessageRow } from "./types";
import { toConversationDetail, toConversationListRow, toMessageRow } from "./serialize";

type ParticipantUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

export function portalConversationDisplayTitle(
  type: string,
  title: string | null,
  projectTitle: string | null,
  locale: "sq" | "en"
): string {
  if (type === "PROJECT") {
    return projectTitle ?? title ?? (locale === "sq" ? "Kanali i projektit" : "Project channel");
  }
  if (type === "GROUP") {
    return title?.trim() || (locale === "sq" ? "Grup — IT Arena" : "Group — IT Arena");
  }
  return PORTAL_BRAND_NAME;
}

function maskLastMessageAuthor(authorName: string, participants: ParticipantUser[]): string {
  const parts = authorName.trim().split(/\s+/);
  if (parts.length < 2) return authorName;
  const match = participants.find(
    (p) => p.firstName === parts[0] && p.lastName === parts.slice(1).join(" ")
  );
  if (match && isStaffRole(match.role)) return PORTAL_BRAND_NAME;
  return authorName;
}

export function toPortalConversationListRow(
  c: Parameters<typeof toConversationListRow>[0],
  currentUserId: string,
  locale: "sq" | "en",
  unreadCount: number
): ConversationListRow {
  const row = toConversationListRow(c, currentUserId, locale, unreadCount);
  const users = c.participants.map((p) => p.user);
  const last = c.messages[0];
  return {
    ...row,
    displayTitle: portalConversationDisplayTitle(
      c.type,
      c.title,
      c.project?.title ?? null,
      locale
    ),
    lastMessage: last
      ? {
          body: last.body.slice(0, 120),
          authorName:
            last.author.role != null && isStaffRole(last.author.role)
              ? PORTAL_BRAND_NAME
              : maskLastMessageAuthor(
                  `${last.author.firstName} ${last.author.lastName}`.trim(),
                  users
                ),
          isInternal: last.isInternal,
          createdAt: last.createdAt.toISOString(),
        }
      : null,
    participants: row.participants.map((p) =>
      isStaffRole(p.role)
        ? { ...p, firstName: PORTAL_BRAND_NAME, lastName: "", email: "" }
        : p
    ),
  };
}

export function toPortalConversationDetail(
  c: Parameters<typeof toConversationDetail>[0],
  currentUserId: string,
  locale: "sq" | "en"
): ConversationDetail {
  const row = toConversationDetail(c, currentUserId, locale);
  return {
    ...row,
    displayTitle: portalConversationDisplayTitle(
      c.type,
      c.title,
      c.project?.title ?? null,
      locale
    ),
    participants: row.participants.map((p) =>
      isStaffRole(p.role)
        ? { ...p, firstName: PORTAL_BRAND_NAME, lastName: "", email: "" }
        : p
    ),
  };
}

export function toPortalMessageRow(
  m: Parameters<typeof toMessageRow>[0]
): ConversationMessageRow {
  const row = toMessageRow(m);
  if (!isStaffRole(row.author.role)) return row;
  return {
    ...row,
    author: {
      ...row.author,
      firstName: PORTAL_BRAND_NAME,
      lastName: "",
    },
  };
}
