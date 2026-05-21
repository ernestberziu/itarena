import { db } from "@/lib/db";
import {
  filterTicketHistoryForClient,
  latestClientStatusHistory,
  resolveClientFacingTicketStatus,
} from "@/lib/ticket-activity";
import type { Priority, Role, TicketStatus } from "@/types/domain";

export async function loadPublicShareTicket(ticketId: string) {
  const ticket = await db.ticket.findUnique({
    where: { id: ticketId },
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true } },
      company: { select: { name: true } },
      comments: {
        where: { isInternal: false },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          body: true,
          isInternal: true,
          createdAt: true,
          guestAuthorName: true,
          author: { select: { id: true, firstName: true, lastName: true, role: true } },
        },
      },
      history: {
        include: {
          changedBy: { select: { firstName: true, lastName: true, role: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!ticket) return null;

  const mappedHistory = ticket.history.map((h) => ({
    ...h,
    changedBy: { ...h.changedBy, role: h.changedBy.role as Role },
  }));

  const dbStatus = ticket.status as TicketStatus;
  const clientHistory = latestClientStatusHistory(filterTicketHistoryForClient(mappedHistory));

  return {
    id: ticket.id,
    number: ticket.number,
    title: ticket.title,
    description: ticket.description,
    status: resolveClientFacingTicketStatus(dbStatus, mappedHistory),
    priority: ticket.priority as Priority,
    division: ticket.division,
    slaDeadline: ticket.slaDeadline,
    resolvedAt: ticket.resolvedAt,
    closedAt: ticket.closedAt,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    createdBy: { ...ticket.createdBy, role: ticket.createdBy.role as Role },
    assignedTo: ticket.assignedTo,
    company: ticket.company,
    comments: ticket.comments.map((c) => ({
      id: c.id,
      body: c.body,
      isInternal: c.isInternal,
      createdAt: c.createdAt,
      guestAuthorName: c.guestAuthorName,
      author: c.author
        ? { ...c.author, role: c.author.role as Role }
        : null,
    })),
    history: clientHistory,
    canComment: ticket.status !== "CLOSED",
  };
}
