import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { TicketDetailView } from "@/components/portal/ticket-detail-view";
import type { TicketStatus, Priority, Role } from "@/types/domain";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/hyr");

  const { locale, id } = await params;

  const ticket = await db.ticket.findUnique({
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
  });

  if (!ticket) notFound();

  // Access control — clients can only see their own tickets
  const isStaff = ["ADMIN", "ENGINEER", "SALES", "OPS"].includes(session.user.role);
  if (!isStaff && ticket.createdById !== session.user.id) notFound();

  // Cast DB string values to domain types
  const typedTicket = {
    ...ticket,
    status: ticket.status as TicketStatus,
    priority: ticket.priority as Priority,
    createdBy: { ...ticket.createdBy, role: ticket.createdBy.role as Role },
    comments: ticket.comments.map((c) => ({
      ...c,
      author: { ...c.author, role: c.author.role as Role },
    })),
    history: ticket.history.map((h) => ({
      ...h,
      changedBy: { ...h.changedBy, role: h.changedBy.role as Role },
    })),
  };

  return (
    <TicketDetailView
      ticket={typedTicket}
      currentUserId={session.user.id}
      currentUserRole={session.user.role as Role}
      locale={locale}
    />
  );
}
