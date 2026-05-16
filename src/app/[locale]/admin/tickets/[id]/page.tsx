import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { AdminTicketDetailView } from "@/components/admin/admin-ticket-detail-view";
import type { TicketStatus, Priority, Role } from "@/types/domain";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/hyr");

  const { locale, id } = await params;
  const acl = await getCachedEffectiveAcl(session.user.id);
  if (!acl) redirect("/hyr");
  requireAdminPageRead(locale, acl, "tickets");

  const lp = locale === "sq" ? "" : `/${locale}`;

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
    db.user.findMany({
      where: { role: { in: ["ADMIN", "ENGINEER", "SALES", "OPS"] } },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
  ]);

  if (!ticket) notFound();

  const typedTicket = {
    ...ticket,
    status: ticket.status as TicketStatus,
    priority: ticket.priority as Priority,
    assignedToId: ticket.assignedToId,
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
    <AdminTicketDetailView
      ticket={typedTicket}
      currentUserRole={session.user.role as Role}
      locale={locale}
      engineers={engineers}
      ticketsListHref={`${lp}/admin/tickets`}
    />
  );
}
