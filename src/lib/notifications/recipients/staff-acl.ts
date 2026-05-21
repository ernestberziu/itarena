import { db } from "@/lib/db";
import type { AdminFeature } from "@/lib/admin-acl/features";
import { STAFF_ROLES } from "@/types/domain";
import { resolveEffectiveAcl, type UserAclInput } from "@/lib/admin-acl/resolve";
import { hasAclLevel } from "@/lib/admin-acl/features";
import { canStaffAccessTicket } from "@/lib/admin-tickets-scope";

export async function listActiveStaffIds(): Promise<string[]> {
  const users = await db.user.findMany({
    where: {
      role: { in: [...STAFF_ROLES] },
      isActive: true,
      deletedAt: null,
    },
    select: { id: true },
  });
  return users.map((u) => u.id);
}

export async function listStaffIdsWithAcl(
  feature: AdminFeature,
  min: "read" | "write"
): Promise<string[]> {
  const staff = await db.user.findMany({
    where: {
      role: { in: [...STAFF_ROLES] },
      isActive: true,
      deletedAt: null,
    },
    select: { id: true, role: true, adminAclJson: true },
  });

  const ids: string[] = [];
  for (const u of staff) {
    const acl = resolveEffectiveAcl({
      role: u.role,
      adminAclJson: u.adminAclJson,
    } as UserAclInput);
    if (hasAclLevel(acl, feature, min)) ids.push(u.id);
  }
  return ids;
}

/** Staff who can access a ticket (assignee scope for non-admins). */
export async function listTicketStaffRecipientIds(ticket: {
  assignedToId: string | null;
}): Promise<string[]> {
  const all = await listStaffIdsWithAcl("tickets", "read");
  const out: string[] = [];
  for (const userId of all) {
    if (await canStaffAccessTicket(userId, ticket)) out.push(userId);
  }
  return out;
}

export async function listAdminIds(): Promise<string[]> {
  const users = await db.user.findMany({
    where: { role: "ADMIN", isActive: true, deletedAt: null },
    select: { id: true },
  });
  return users.map((u) => u.id);
}
