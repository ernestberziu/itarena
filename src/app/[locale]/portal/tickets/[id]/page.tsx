import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { TicketDetailView } from "@/components/portal/ticket-detail-view";
import {
  filterTicketHistoryForClient,
  latestClientStatusHistory,
  resolveClientFacingTicketStatus,
} from "@/lib/ticket-activity";
import { STAFF_ROLES, type TicketStatus, type Priority, type Role } from "@/types/domain";
import { canViewPortalTicket, isPortalTicketOwner, portalUser } from "@/lib/portal/access";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/hyr");

  const { locale, id } = await params;

  const isStaff = STAFF_ROLES.includes(session.user.role as Role);

  const [ticket, engineers] = await Promise.all([
    db.ticket.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        company: { select: { name: true } },
        comments: {
          include: {
            author: { select: { id: true, firstName: true, lastName: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        history: {
          include: {
            changedBy: { select: { firstName: true, lastName: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    isStaff
      ? db.user.findMany({
          where: { role: { in: ["ADMIN", "ENGINEER", "SALES", "OPS"] } },
          select: { id: true, firstName: true, lastName: true },
          orderBy: { firstName: "asc" },
        })
      : Promise.resolve([]),
  ]);

  if (!ticket) notFound();

  const clientUser = portalUser(session);
  if (!isStaff && !canViewPortalTicket(clientUser, ticket)) notFound();

  const isOwner = isPortalTicketOwner(clientUser, ticket);

  const mappedHistory = ticket.history.map((h) => ({
    ...h,
    changedBy: { ...h.changedBy, role: h.changedBy.role as Role },
  }));

  const dbStatus = ticket.status as TicketStatus;
  const clientHistory = latestClientStatusHistory(filterTicketHistoryForClient(mappedHistory));

  // Cast DB string values to domain types
  const typedTicket = {
    ...ticket,
    status: isStaff ? dbStatus : resolveClientFacingTicketStatus(dbStatus, mappedHistory),
    priority: ticket.priority as Priority,
    createdBy: { ...ticket.createdBy, role: ticket.createdBy.role as Role },
    comments: ticket.comments.map((c) => ({
      ...c,
      author: { ...c.author, role: c.author.role as Role },
    })),
    history: isStaff ? mappedHistory : clientHistory,
  };

  return (
    <TicketDetailView
      ticket={typedTicket}
      currentUserId={session.user.id}
      currentUserRole={session.user.role as Role}
      locale={locale}
      engineers={isStaff ? engineers : undefined}
      readOnlyForViewer={!isStaff && !isOwner}
    />
  );
}
