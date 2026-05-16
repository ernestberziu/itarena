import type { Prisma } from "@prisma/client";
import {
  ADMIN_TICKET_PRIORITY_OPTIONS,
  ADMIN_TICKET_STATUS_OPTIONS,
} from "@/lib/admin-ticket-filters";

export type AdminTicketsListQuery = {
  q?: string | null;
  status?: string | null;
  priority?: string | null;
  filter?: string | null;
  /** User id (cuid) — filter tickets created by this portal user */
  requester?: string | null;
  /** User id (cuid) or literal `unassigned` for tickets with no assignee */
  assignee?: string | null;
};

/** URL-driven filters for the admin tickets list (matches previous page logic). */
export function adminTicketsListWhere(input: AdminTicketsListQuery): Prisma.TicketWhereInput {
  const where: Prisma.TicketWhereInput = {};
  const status = input.status?.trim();
  const priority = input.priority?.trim();
  const breachedOnly = input.filter === "breached";
  const q = input.q?.trim();
  const assigneeRaw = input.assignee?.trim();
  const requesterRaw = input.requester?.trim();

  if (status && (ADMIN_TICKET_STATUS_OPTIONS as readonly string[]).includes(status)) {
    where.status = status;
  }
  if (priority && (ADMIN_TICKET_PRIORITY_OPTIONS as readonly string[]).includes(priority)) {
    where.priority = priority;
  }
  if (breachedOnly) {
    where.slaBreached = true;
    where.status = { notIn: ["RESOLVED", "CLOSED"] };
  }
  if (assigneeRaw === "unassigned") {
    where.assignedToId = null;
  } else if (assigneeRaw) {
    const cuidLike = /^c[a-z0-9]{24}$/i;
    if (cuidLike.test(assigneeRaw)) {
      where.assignedToId = assigneeRaw;
    }
  }
  if (requesterRaw) {
    const cuidLike = /^c[a-z0-9]{24}$/i;
    if (cuidLike.test(requesterRaw)) {
      where.createdById = requesterRaw;
    }
  }
  if (q) {
    where.OR = [{ title: { contains: q } }, { number: { contains: q } }];
  }
  return where;
}
