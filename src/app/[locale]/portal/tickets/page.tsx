import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Plus, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TicketStatusBadge } from "@/components/portal/ticket-status-badge";
import { PriorityBadge } from "@/components/portal/priority-badge";
import { SlaIndicator } from "@/components/portal/sla-indicator";
import type { TicketStatus, Priority } from "@/types/domain";
import { timeAgo } from "@/lib/utils";
import { DIVISION_LABELS } from "@/lib/sla";
import { Badge } from "@/components/ui/badge";

const STATUS_TABS = ["ALL", "OPEN", "ASSIGNED", "IN_PROGRESS", "PAUSED", "PENDING_CLIENT", "RESOLVED", "CLOSED"] as const;
const PRIORITY_OPTIONS = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;

export default async function TicketsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await auth();
  if (!session) redirect("/hyr");

  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "tickets" });
  const lp = locale === "sq" ? "" : `/${locale}`;

  const statusFilter = sp.status && STATUS_TABS.includes(sp.status as typeof STATUS_TABS[number]) ? sp.status : "ALL";
  const priorityFilter = sp.priority && PRIORITY_OPTIONS.includes(sp.priority as typeof PRIORITY_OPTIONS[number]) ? sp.priority : "ALL";
  const q = sp.q?.trim();

  const isStaff = ["ADMIN", "ENGINEER", "SALES", "OPS"].includes(session.user.role);

  const where: Record<string, unknown> = isStaff ? {} : { createdById: session.user.id };
  if (statusFilter !== "ALL") where.status = statusFilter;
  if (priorityFilter !== "ALL") where.priority = priorityFilter;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { number: { contains: q } },
    ];
  }

  // Get counts per status for badges
  const [tickets, counts] = await Promise.all([
    db.ticket.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      include: {
        createdBy: { select: { firstName: true, lastName: true, email: true } },
        assignedTo: { select: { firstName: true, lastName: true } },
        company: { select: { name: true } },
      },
    }),
    db.ticket.groupBy({
      by: ["status"],
      _count: true,
      where: isStaff ? {} : { createdById: session.user.id },
    }),
  ]);

  const countByStatus = counts.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = c._count;
    return acc;
  }, {});
  const totalCount = Object.values(countByStatus).reduce((a, b) => a + b, 0);

  const statusLabels: Record<string, string> =
    locale === "sq"
      ? { ALL: "Të gjitha", OPEN: "Hapur", ASSIGNED: "Caktuar", IN_PROGRESS: "Në punë", PAUSED: "Në pauzë", PENDING_CLIENT: "Pret", RESOLVED: "Zgjidhur", CLOSED: "Mbyllur" }
      : { ALL: "All", OPEN: "Open", ASSIGNED: "Assigned", IN_PROGRESS: "In Progress", PAUSED: "Paused", PENDING_CLIENT: "Pending", RESOLVED: "Resolved", CLOSED: "Closed" };

  function tabHref(status: string) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (priorityFilter !== "ALL") p.set("priority", priorityFilter);
    if (status !== "ALL") p.set("status", status);
    const qs = p.toString();
    return `${lp}/portal/tickets${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("title")}
        description={`${tickets.length} ${locale === "sq" ? "bileta" : "tickets"}`}
        actions={
          <Button asChild size="sm">
            <Link href={`${lp}/portal/tickets/new`}>
              <Plus className="h-4 w-4 mr-1.5" strokeWidth={2} />
              {t("new")}
            </Link>
          </Button>
        }
      />

      {/* Status tabs */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {STATUS_TABS.map((status) => {
          const isActive = statusFilter === status;
          const count = status === "ALL" ? totalCount : countByStatus[status] ?? 0;
          return (
            <Link key={status} href={tabHref(status)}>
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {statusLabels[status]}
                {count > 0 && (
                  <span
                    className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full text-[10px] font-bold px-1 ${
                      isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Search + Priority filter */}
      <div className="flex flex-wrap gap-2 items-center">
        <form method="GET" action={`${lp}/portal/tickets`}>
          <input
            name="q"
            defaultValue={q}
            placeholder={locale === "sq" ? "Kërko biletë..." : "Search tickets..."}
            className="h-8 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-52"
          />
          {statusFilter !== "ALL" && <input type="hidden" name="status" value={statusFilter} />}
          {priorityFilter !== "ALL" && <input type="hidden" name="priority" value={priorityFilter} />}
        </form>

        <div className="flex gap-1 items-center">
          <span className="text-xs text-muted-foreground">Prioriteti:</span>
          {PRIORITY_OPTIONS.map((p) => {
            const pLabel: Record<string, string> = locale === "sq"
              ? { ALL: "Të gjitha", CRITICAL: "Kritike", HIGH: "E lartë", MEDIUM: "Mesatare", LOW: "E ulët" }
              : { ALL: "All", CRITICAL: "Critical", HIGH: "High", MEDIUM: "Medium", LOW: "Low" };
            const href = (() => {
              const params = new URLSearchParams();
              if (q) params.set("q", q);
              if (statusFilter !== "ALL") params.set("status", statusFilter);
              if (p !== "ALL") params.set("priority", p);
              const qs = params.toString();
              return `${lp}/portal/tickets${qs ? `?${qs}` : ""}`;
            })();
            return (
              <Link key={p} href={href}>
                <Badge variant={priorityFilter === p ? "default" : "outline"} className="cursor-pointer text-xs">
                  {pLabel[p]}
                </Badge>
              </Link>
            );
          })}
        </div>
      </div>

      {tickets.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title={t("empty")}
          description={t("empty_desc")}
          action={{ label: t("new"), href: `${lp}/portal/tickets/new` }}
        />
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="divide-y">
            {tickets.map((ticket) => {
              const divLabel = DIVISION_LABELS[ticket.division]?.[locale as "sq" | "en"] ?? ticket.division;
              return (
                <Link
                  key={ticket.id}
                  href={`${lp}/portal/tickets/${ticket.id}`}
                  className="group flex items-center gap-4 px-4 py-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">
                        {ticket.number}
                      </span>
                      <TicketStatusBadge status={ticket.status as TicketStatus} locale={locale} />
                      <PriorityBadge priority={ticket.priority as Priority} locale={locale} />
                    </div>
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {ticket.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>{divLabel}</span>
                      {ticket.assignedTo && (
                        <span>→ {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}</span>
                      )}
                      <span>{timeAgo(ticket.updatedAt)}</span>
                    </div>
                  </div>
                  {ticket.slaDeadline && (
                    <SlaIndicator
                      createdAt={ticket.createdAt}
                      deadline={new Date(ticket.slaDeadline)}
                      status={ticket.status as TicketStatus}
                      locale={locale}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
