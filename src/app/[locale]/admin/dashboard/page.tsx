import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Ticket,
  Users,
  ShoppingBag,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TicketStatusBadge } from "@/components/portal/ticket-status-badge";
import { PriorityBadge } from "@/components/portal/priority-badge";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import type { TicketStatus, Priority } from "@/types/domain";
import { timeAgo, formatPrice } from "@/lib/utils";
import { RevenueChart, TicketBarChart, SlaRing } from "@/components/admin/dashboard-charts";
import { subDays, format, startOfDay } from "date-fns";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";
import { hasAclLevel } from "@/lib/admin-acl/features";
import { isCalendarAdmin } from "@/lib/calendar/access";
import {
  getCalendarDay,
  getTodayCalendarDate,
  getYesterdayCalendarDate,
} from "@/lib/calendar";
import { DashboardStaffReportsSection } from "@/components/admin/dashboard-staff-reports-section";
import { AdminDashboardNotifications } from "@/components/admin/admin-dashboard-notifications";
import { countSlaCompliance, isSlaBreached, getMissedSlaTicketIds } from "@/lib/sla";
import { shouldScopeTicketsToAssignee, ticketsAssignedToWhere } from "@/lib/admin-tickets-scope";
import type { Prisma } from "@prisma/client";
import { dbUnavailableDescription } from "@/lib/db-unavailable-message";

async function fetchAdminDashboardData(
  thirtyDaysAgo: Date,
  todayStart: Date,
  userId: string,
  scopeTickets: boolean
) {
  const ticketScope: Prisma.TicketWhereInput = scopeTickets
    ? ticketsAssignedToWhere(userId)
    : {};

  const missedSlaIdsPromise = getMissedSlaTicketIds(db);

  const [
    openTickets,
    missedSlaIds,
    missedSlaTickets,
    resolvedToday,
    totalClients,
    pendingQuotes,
    pendingOrders,
    totalRevenue,
    recentTickets,
    recentOrders,
    recentActivity,
    ticketsByStatus,
    recentOrders30d,
  ] = await Promise.all([
    db.ticket.count({
      where: { ...ticketScope, status: { notIn: ["RESOLVED", "CLOSED"] } },
    }),
    missedSlaIdsPromise,
    db.ticket.findMany({
      where: {
        ...ticketScope,
        slaDeadline: { not: null },
        status: { not: "CLOSED" },
      },
      select: { slaDeadline: true, status: true, resolvedAt: true },
    }),
    db.ticket.count({
      where: { ...ticketScope, status: "RESOLVED", resolvedAt: { gte: todayStart } },
    }),
    db.user.count({ where: { role: { in: ["CLIENT", "COMPANY_ADMIN"] } } }),
    db.quote.count({ where: { status: "PENDING" } }),
    db.order.count({ where: { status: "PLACED" } }),
    db.order.aggregate({ _sum: { total: true }, where: { status: { notIn: ["CANCELLED"] } } }),
    db.ticket.findMany({
      where: { ...ticketScope, status: { notIn: ["RESOLVED", "CLOSED"] } },
      orderBy: [{ slaDeadline: "asc" }, { priority: "desc" }, { createdAt: "asc" }],
      take: 8,
      select: {
        id: true,
        number: true,
        title: true,
        status: true,
        priority: true,
        slaDeadline: true,
        resolvedAt: true,
        createdBy: { select: { firstName: true, lastName: true } },
        assignedTo: { select: { firstName: true, lastName: true } },
      },
    }),
    db.order.findMany({
      where: { status: "PLACED" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { firstName: true, lastName: true } } },
    }),
    db.ticketHistory.findMany({
      where: scopeTickets ? { ticket: { assignedToId: userId } } : undefined,
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        changedBy: { select: { firstName: true, lastName: true } },
        ticket: { select: { number: true, title: true } },
      },
    }),
    db.ticket.groupBy({
      by: ["status"],
      where: ticketScope,
      _count: true,
    }),
    db.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo }, status: { notIn: ["CANCELLED"] } },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const breachedTickets =
    missedSlaIds.length === 0
      ? 0
      : scopeTickets
        ? await db.ticket.count({
            where: { ...ticketScope, id: { in: missedSlaIds } },
          })
        : missedSlaIds.length;

  const slaCompliance = countSlaCompliance(missedSlaTickets);

  return {
    openTickets,
    breachedTickets,
    resolvedToday,
    totalClients,
    pendingQuotes,
    pendingOrders,
    totalRevenue,
    recentTickets,
    recentOrders,
    recentActivity,
    ticketsByStatus,
    recentOrders30d,
    slaCompliance,
  };
}

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/hyr");

  const { locale } = await params;
  const acl = await getCachedEffectiveAcl(session.user.id);
  if (!acl) redirect("/hyr");
  requireAdminPageRead(locale, acl, "dashboard");

  const lp = locale === "sq" ? "" : `/${locale}`;
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const todayStart = startOfDay(now);
  const canViewCalendar = hasAclLevel(acl, "calendar", "read");
  const isAdmin = session.user.role === "ADMIN";
  const scopeTickets = await shouldScopeTicketsToAssignee(session.user.id);

  let staffReports: {
    today: Awaited<ReturnType<typeof getCalendarDay>>;
    yesterday: Awaited<ReturnType<typeof getCalendarDay>>;
  } | null = null;

  if (canViewCalendar) {
    try {
      const todayStr = getTodayCalendarDate();
      const yesterdayStr = getYesterdayCalendarDate();
      const [today, yesterday] = await Promise.all([
        getCalendarDay(todayStr, session.user.id, isCalendarAdmin(session.user.role)),
        getCalendarDay(yesterdayStr, session.user.id, isCalendarAdmin(session.user.role)),
      ]);
      staffReports = { today, yesterday };
    } catch {
      staffReports = null;
    }
  }

  let data: Awaited<ReturnType<typeof fetchAdminDashboardData>>;
  try {
    data = await fetchAdminDashboardData(thirtyDaysAgo, todayStart, session.user.id, scopeTickets);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[admin/dashboard] database error:", err);
    }
    const dbMsg = dbUnavailableDescription(locale, "dashboard");
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title={locale === "sq" ? "Paneli i Operacioneve" : "Operations Dashboard"}
          description={
            locale === "sq"
              ? "Pamja e plotë e operacioneve në kohë reale"
              : "Full real-time operations overview"
          }
          toolbar={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild className="text-xs">
                <Link href={`${lp}/admin/tickets/new`}>{locale === "sq" ? "Biletë e re" : "New ticket"}</Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="text-xs">
                <Link href={`${lp}/admin/orders`}>{locale === "sq" ? "Porosi" : "Orders"}</Link>
              </Button>
            </div>
          }
        />
        <EmptyState
          icon={AlertTriangle}
          title={locale === "sq" ? "Postgres nuk është i lidhur" : "PostgreSQL unavailable"}
          description={locale === "sq" ? dbMsg.sq : dbMsg.en}
        />
      </div>
    );
  }

  const {
    openTickets,
    breachedTickets,
    resolvedToday,
    totalClients,
    pendingQuotes,
    pendingOrders,
    totalRevenue,
    recentTickets,
    recentOrders,
    recentActivity,
    ticketsByStatus,
    recentOrders30d,
    slaCompliance,
  } = data;

  // Build 30-day revenue chart data
  const dayMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = format(subDays(new Date(), i), "dd/MM");
    dayMap[d] = 0;
  }
  for (const order of recentOrders30d) {
    const d = format(order.createdAt, "dd/MM");
    if (d in dayMap) dayMap[d] += Number(order.total);
  }
  const revenueData = Object.entries(dayMap)
    .filter((_, i) => i % 3 === 0) // show every 3rd day to avoid crowding
    .map(([date, total]) => ({ date, total }));

  // Ticket by status chart
  const statusLabels: Record<string, string> =
    locale === "sq"
      ? { OPEN: "Hapur", ASSIGNED: "Caktuar", IN_PROGRESS: "Në punë", PAUSED: "Në pauzë", PENDING_CLIENT: "Pret klientin", RESOLVED: "Zgjidhur", CLOSED: "Mbyllur" }
      : { OPEN: "Open", ASSIGNED: "Assigned", IN_PROGRESS: "In Progress", PAUSED: "Paused", PENDING_CLIENT: "Pending", RESOLVED: "Resolved", CLOSED: "Closed" };
  const ticketChartData = ticketsByStatus.map((s) => ({
    status: s.status,
    count: s._count,
    label: statusLabels[s.status] ?? s.status,
  }));

  const canNotifications = hasAclLevel(acl, "notifications", "read");
  const canTickets = hasAclLevel(acl, "tickets", "read");
  const canClients = hasAclLevel(acl, "clients", "read");
  const canQuotes = hasAclLevel(acl, "quotes", "read");
  const canOrders = hasAclLevel(acl, "orders", "read");
  const canReports = hasAclLevel(acl, "reports", "read");
  const canWriteTickets = hasAclLevel(acl, "tickets", "write");
  const canWriteOrders = hasAclLevel(acl, "orders", "write");
  const canWriteQuotes = hasAclLevel(acl, "quotes", "write");

  const kpiDefinitions: {
    feature: "tickets" | "clients" | "quotes" | "orders" | "reports";
    title: string;
    value: string | number;
    icon: typeof Ticket;
    href: string;
    iconColor: string;
    iconBg: string;
  }[] = [
    {
      feature: "tickets",
      title: locale === "sq" ? "Bileta Aktive" : "Active Tickets",
      value: openTickets,
      icon: Ticket,
      href: `${lp}/admin/tickets`,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      feature: "tickets",
      title: locale === "sq" ? "SLA Shkelur" : "SLA Breached",
      value: breachedTickets,
      icon: AlertTriangle,
      href: `${lp}/admin/tickets?filter=breached`,
      iconColor: "text-red-600",
      iconBg: "bg-red-50 dark:bg-red-950/40",
    },
    {
      feature: "tickets",
      title: locale === "sq" ? "Zgjidhur Sot" : "Resolved Today",
      value: resolvedToday,
      icon: CheckCircle2,
      href: `${lp}/admin/tickets`,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      feature: "clients",
      title: locale === "sq" ? "Klientë Total" : "Total Clients",
      value: totalClients,
      icon: Users,
      href: `${lp}/admin/clients`,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50 dark:bg-purple-950/40",
    },
    {
      feature: "quotes",
      title: locale === "sq" ? "Oferta Pritëse" : "Pending Quotes",
      value: pendingQuotes,
      icon: FileText,
      href: `${lp}/admin/quotes`,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50 dark:bg-amber-950/40",
    },
    {
      feature: "orders",
      title: locale === "sq" ? "Porosi Pritëse" : "Pending Orders",
      value: pendingOrders,
      icon: ShoppingBag,
      href: `${lp}/admin/orders`,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/40",
    },
    {
      feature: "reports",
      title: locale === "sq" ? "Xhiro Totale" : "Total Revenue",
      value: formatPrice(Number(totalRevenue._sum.total ?? 0)),
      icon: TrendingUp,
      href: `${lp}/admin/reports`,
      iconColor: "text-teal-600",
      iconBg: "bg-teal-50 dark:bg-teal-950/40",
    },
  ];

  const kpis = kpiDefinitions.filter((kpi) => hasAclLevel(acl, kpi.feature, "read"));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={locale === "sq" ? "Paneli i Operacioneve" : "Operations Dashboard"}
        description={
          locale === "sq"
            ? "Pamja e plotë e operacioneve në kohë reale"
            : "Full real-time operations overview"
        }
        toolbar={
          <div className="flex flex-wrap gap-2">
            {canWriteTickets && (
              <Button variant="outline" size="sm" asChild className="text-xs">
                <Link href={`${lp}/admin/tickets/new`}>{locale === "sq" ? "Biletë e re" : "New ticket"}</Link>
              </Button>
            )}
            {canWriteOrders && (
              <Button variant="outline" size="sm" asChild className="text-xs">
                <Link href={`${lp}/admin/orders`}>{locale === "sq" ? "Porosi" : "Orders"}</Link>
              </Button>
            )}
            {canWriteQuotes && (
              <Button variant="outline" size="sm" asChild className="text-xs">
                <Link href={`${lp}/admin/quotes`}>{locale === "sq" ? "Oferta" : "Quotes"}</Link>
              </Button>
            )}
            {canReports && (
              <Button variant="outline" size="sm" asChild className="text-xs">
                <Link href={`${lp}/admin/reports`}>{locale === "sq" ? "Raportet" : "Reports"}</Link>
              </Button>
            )}
          </div>
        }
      />

      {/* KPI grid */}
      {kpis.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-3">
          {kpis.map((kpi) => (
            <StatCard key={kpi.title} {...kpi} />
          ))}
        </div>
      )}

      {canNotifications && (
        <AdminDashboardNotifications
          userId={session.user.id}
          locale={locale}
          lp={lp}
          title={locale === "sq" ? "Njoftimet" : "Notifications"}
        />
      )}

      {staffReports && (
        <DashboardStaffReportsSection
          locale={locale}
          lp={lp}
          isAdmin={isAdmin}
          today={staffReports.today}
          yesterday={staffReports.yesterday}
        />
      )}

      {/* Charts row */}
      {(canReports || canTickets) && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {canReports && (
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
              {locale === "sq" ? "Xhiro — 30 ditët e fundit" : "Revenue — last 30 days"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>
        )}

        {canTickets && (
        <Card className={canReports ? undefined : "lg:col-span-3"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
              {locale === "sq" ? "Përputhshmëria SLA" : "SLA Compliance"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-4">
            <SlaRing compliant={slaCompliance.compliant} breached={slaCompliance.breached} />
          </CardContent>
        </Card>
        )}
      </div>
      )}

      {canTickets && (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Ticket className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
            {locale === "sq" ? "Biletat sipas statusit" : "Tickets by status"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <TicketBarChart data={ticketChartData} />
        </CardContent>
      </Card>
      )}

      {/* Bottom grid */}
      {canTickets && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {canTickets && (
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between border-b">
            <CardTitle className="text-sm font-semibold">
              {locale === "sq" ? "Biletat Aktive" : "Active Tickets"}
            </CardTitle>
            <Link href={`${lp}/admin/tickets`} className="text-xs text-primary hover:underline font-medium">
              {locale === "sq" ? "Shiko të gjitha →" : "View all →"}
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentTickets.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-10">
                {locale === "sq" ? "Nuk ka bileta aktive" : "No active tickets"}
              </p>
            ) : (
              <div className="divide-y">
                {recentTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`${lp}/admin/tickets/${ticket.id}`}
                    className="group flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
                  >
                    {isSlaBreached({
                      slaDeadline: ticket.slaDeadline,
                      status: ticket.status,
                      resolvedAt: ticket.resolvedAt,
                    }) && (
                      <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" strokeWidth={2} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono text-muted-foreground">{ticket.number}</span>
                        <PriorityBadge priority={ticket.priority as Priority} locale={locale} />
                      </div>
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{ticket.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {ticket.createdBy.firstName} {ticket.createdBy.lastName}
                        {ticket.assignedTo && <> → {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}</>}
                      </p>
                    </div>
                    <TicketStatusBadge status={ticket.status as TicketStatus} locale={locale} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {canTickets && (
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
              {locale === "sq" ? "Aktiviteti i fundit" : "Recent Activity"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground py-10 text-center">
                  {locale === "sq" ? "Nuk ka aktivitet" : "No activity yet"}
                </p>
              ) : recentActivity.map((h) => (
                <div key={h.id} className="px-4 py-3 space-y-0.5">
                  <p className="text-xs font-medium text-foreground truncate">
                    {h.changedBy.firstName} {h.changedBy.lastName}
                    <span className="text-muted-foreground font-normal">
                      {" "}{locale === "sq" ? "ndryshoi" : "changed"} {h.field}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {h.ticket.number} — {h.oldValue ?? "—"} → {h.newValue ?? "—"}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                    <Clock className="h-3 w-3" strokeWidth={2} />
                    {timeAgo(h.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        )}
      </div>
      )}

      {canOrders && (
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between border-b">
          <CardTitle className="text-sm font-semibold">
            {locale === "sq" ? "Porosi Pritëse Konfirmim" : "Orders Awaiting Confirmation"}
          </CardTitle>
          <Link href={`${lp}/admin/orders`} className="text-xs text-primary hover:underline font-medium">
            {locale === "sq" ? "Shiko të gjitha →" : "View all →"}
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recentOrders.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-10">
              {locale === "sq" ? "Nuk ka porosi pritëse" : "No pending orders"}
            </p>
          ) : (
            <div className="divide-y">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`${lp}/admin/orders`}
                  className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/40 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium font-mono">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.user.firstName} {order.user.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatPrice(Number(order.total))}</p>
                    <div className="flex items-center gap-1 text-xs text-amber-600 justify-end">
                      <Clock className="h-3 w-3" strokeWidth={2} />
                      {timeAgo(order.createdAt)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      )}
    </div>
  );
}
