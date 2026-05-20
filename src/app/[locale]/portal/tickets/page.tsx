import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Plus, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminListToolbar,
  AdminListToolbarSearch,
} from "@/components/admin/admin-list-toolbar";
import {
  SegmentedFilterLink,
  SegmentedFilterTrack,
} from "@/components/admin/admin-filter-segments";
import { EmptyState } from "@/components/shared/empty-state";
import { PortalTicketsTable, type PortalTicketRow } from "@/components/portal/tables/portal-tickets-table";
import { portalTicketWhere, portalUsesCompanyScope } from "@/lib/portal/scope";
import { portalUser } from "@/lib/portal/access";
import { adminListShellClassName } from "@/lib/admin-list-ui";
import { resolveClientFacingTicketStatus } from "@/lib/ticket-activity";
import type { TicketStatus } from "@/types/domain";

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
  const tPortal = await getTranslations({ locale, namespace: "portal" });
  const lp = locale === "sq" ? "" : `/${locale}`;

  const user = portalUser(session);
  const companyScope = portalUsesCompanyScope(user);

  const statusFilter = sp.status && STATUS_TABS.includes(sp.status as typeof STATUS_TABS[number]) ? sp.status : "ALL";
  const priorityFilter = sp.priority && PRIORITY_OPTIONS.includes(sp.priority as typeof PRIORITY_OPTIONS[number]) ? sp.priority : "ALL";
  const q = sp.q?.trim();

  const baseWhere = portalTicketWhere(user);
  const where: Record<string, unknown> = { ...baseWhere };
  if (statusFilter !== "ALL") where.status = statusFilter;
  if (priorityFilter !== "ALL") where.priority = priorityFilter;
  if (q) {
    where.OR = [{ title: { contains: q } }, { number: { contains: q } }];
  }

  const countWhere = portalTicketWhere(user);

  const [tickets, counts] = await Promise.all([
    db.ticket.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      include: {
        createdBy: { select: { firstName: true, lastName: true, email: true, role: true } },
        assignedTo: { select: { firstName: true, lastName: true } },
        company: { select: { name: true } },
        history: {
          where: { field: "status" },
          orderBy: { createdAt: "asc" },
          select: { field: true, newValue: true, createdAt: true },
        },
      },
    }),
    db.ticket.groupBy({
      by: ["status"],
      _count: true,
      where: countWhere,
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

  const rows: PortalTicketRow[] = tickets.map((ticket) => ({
    id: ticket.id,
    number: ticket.number,
    title: ticket.title,
    status: resolveClientFacingTicketStatus(
      ticket.status as TicketStatus,
      ticket.history
    ),
    priority: ticket.priority,
    division: ticket.division,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    createdBy: ticket.createdBy,
    assignedTo: ticket.assignedTo,
  }));

  const pLabel: Record<string, string> =
    locale === "sq"
      ? { ALL: "Të gjitha", CRITICAL: "Kritike", HIGH: "E lartë", MEDIUM: "Mesatare", LOW: "E ulët" }
      : { ALL: "All", CRITICAL: "Critical", HIGH: "High", MEDIUM: "Medium", LOW: "Low" };

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title={t("title")}
        description={
          companyScope
            ? `${tickets.length} ${locale === "sq" ? "bileta" : "tickets"} · ${tPortal("company_scope_hint")}`
            : `${tickets.length} ${locale === "sq" ? "bileta" : "tickets"}`
        }
        actions={
          <Button asChild size="sm">
            <Link href={`${lp}/portal/tickets/new`}>
              <Plus className="mr-1.5 h-4 w-4" strokeWidth={2} />
              {t("new")}
            </Link>
          </Button>
        }
      />

      <AdminListToolbar>
        <div className="space-y-3">
          <SegmentedFilterTrack>
            {STATUS_TABS.map((status) => {
              const count = status === "ALL" ? totalCount : countByStatus[status] ?? 0;
              const label = count > 0 ? `${statusLabels[status]} (${count})` : statusLabels[status];
              return (
                <SegmentedFilterLink
                  key={status}
                  href={tabHref(status)}
                  label={label}
                  selected={statusFilter === status}
                />
              );
            })}
          </SegmentedFilterTrack>

          <div className="flex flex-wrap items-center gap-3">
            <AdminListToolbarSearch
              action={`${lp}/portal/tickets`}
              placeholder={locale === "sq" ? "Kërko biletë…" : "Search tickets…"}
              defaultQuery={q}
              locale={locale}
              submitLabelSq="Kërko"
              submitLabelEn="Search"
              hiddenFields={{
                ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
                ...(priorityFilter !== "ALL" ? { priority: priorityFilter } : {}),
              }}
            />
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">
                {locale === "sq" ? "Prioriteti:" : "Priority:"}
              </span>
              {PRIORITY_OPTIONS.map((p) => {
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
        </div>
      </AdminListToolbar>

      {tickets.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title={t("empty")}
          description={t("empty_desc")}
          action={{ label: t("new"), href: `${lp}/portal/tickets/new` }}
        />
      ) : (
        <div className={adminListShellClassName}>
          <PortalTicketsTable rows={rows} locale={locale} lp={lp} companyScope={companyScope} />
        </div>
      )}
    </div>
  );
}
