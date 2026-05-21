import { db } from "@/lib/db";
import { STAFF_ROLES } from "@/types/domain";

export async function listPortalTicketViewerIds(ticket: {
  id: string;
  createdById: string;
  companyId: string | null;
}): Promise<string[]> {
  const ids = new Set<string>([ticket.createdById]);

  if (ticket.companyId) {
    const companyUsers = await db.user.findMany({
      where: {
        companyId: ticket.companyId,
        role: "COMPANY_ADMIN",
        isActive: true,
        deletedAt: null,
      },
      select: { id: true },
    });
    for (const u of companyUsers) ids.add(u.id);
  }

  const users = await db.user.findMany({
    where: { id: { in: [...ids] } },
    select: { id: true, role: true },
  });

  return users
    .filter((u) => !STAFF_ROLES.includes(u.role as (typeof STAFF_ROLES)[number]))
    .map((u) => u.id);
}

export async function listPortalQuoteViewerIds(quote: {
  requestedById: string;
  companyId: string | null;
}): Promise<string[]> {
  const ids = new Set<string>([quote.requestedById]);
  if (quote.companyId) {
    const companyUsers = await db.user.findMany({
      where: {
        companyId: quote.companyId,
        role: "COMPANY_ADMIN",
        isActive: true,
        deletedAt: null,
      },
      select: { id: true },
    });
    for (const u of companyUsers) ids.add(u.id);
  }
  return [...ids];
}

export async function listPortalOrderViewerIds(order: {
  userId: string;
  companyId: string | null;
}): Promise<string[]> {
  const ids = new Set<string>([order.userId]);
  if (order.companyId) {
    const companyUsers = await db.user.findMany({
      where: {
        companyId: order.companyId,
        role: "COMPANY_ADMIN",
        isActive: true,
        deletedAt: null,
      },
      select: { id: true },
    });
    for (const u of companyUsers) ids.add(u.id);
  }
  return [...ids];
}

export async function listProjectPortalRecipientIds(projectId: string): Promise<string[]> {
  const links = await db.projectClient.findMany({
    where: { projectId },
    select: { userId: true, companyId: true },
  });

  const ids = new Set<string>();
  for (const link of links) {
    if (link.userId) ids.add(link.userId);
    if (link.companyId) {
      const companyUsers = await db.user.findMany({
        where: {
          companyId: link.companyId,
          isActive: true,
          deletedAt: null,
        },
        select: { id: true, role: true },
      });
      for (const u of companyUsers) {
        if (u.role === "COMPANY_ADMIN" || u.role === "CLIENT") ids.add(u.id);
      }
    }
  }
  return [...ids];
}

export async function listProjectMemberStaffIds(projectId: string): Promise<string[]> {
  const members = await db.projectMember.findMany({
    where: { projectId },
    select: { userId: true },
  });
  return members.map((m) => m.userId);
}

export async function listConversationParticipantIds(
  conversationId: string
): Promise<string[]> {
  const parts = await db.conversationParticipant.findMany({
    where: { conversationId },
    select: { userId: true },
  });
  return parts.map((p) => p.userId);
}
