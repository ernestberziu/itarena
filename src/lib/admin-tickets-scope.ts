import type { Prisma } from "@prisma/client";
import { isAdminUser } from "@/lib/projects/access";

/** Non-admin staff only see tickets assigned to them. */
export async function shouldScopeTicketsToAssignee(userId: string): Promise<boolean> {
  return !(await isAdminUser(userId));
}

export function ticketsAssignedToWhere(userId: string): Prisma.TicketWhereInput {
  return { assignedToId: userId };
}

export async function mergeStaffTicketScope(
  where: Prisma.TicketWhereInput,
  userId: string
): Promise<Prisma.TicketWhereInput> {
  if (!(await shouldScopeTicketsToAssignee(userId))) return where;
  return { AND: [where, ticketsAssignedToWhere(userId)] };
}

export async function canStaffAccessTicket(
  userId: string,
  ticket: { assignedToId: string | null }
): Promise<boolean> {
  if (!(await shouldScopeTicketsToAssignee(userId))) return true;
  return ticket.assignedToId === userId;
}
