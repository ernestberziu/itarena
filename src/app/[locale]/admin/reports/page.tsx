import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { startOfDay, endOfDay, format, subDays } from "date-fns";
import { BarChart3, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { FilterBar } from "@/components/admin/filter-bar";
import { StatCard } from "@/components/shared/stat-card";
import { RevenueChart, TicketBarChart, SlaRing } from "@/components/admin/dashboard-charts";
import { formatPrice } from "@/lib/utils";

export default async function AdminReportsPage({
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
  const lp = locale === "sq" ? "" : `/${locale}`;

  const now = new Date();
  const defaultFrom = startOfDay(subDays(now, 30));
  const fromRaw = sp.from?.trim();
  const toRaw = sp.to?.trim();
  const from = fromRaw ? startOfDay(new Date(fromRaw)) : defaultFrom;
  const to = toRaw ? endOfDay(new Date(toRaw)) : endOfDay(now);

  const fromSafe = Number.isNaN(from.getTime()) ? defaultFrom : from;
  const toSafe = Number.isNaN(to.getTime()) ? endOfDay(now) : to;

  const [orderStats, ticketsByStatus, resolvedTickets, recentOrders] = await Promise.all([
    db.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: { createdAt: { gte: fromSafe, lte: toSafe }, status: { notIn: ["CANCELLED"] } },
    }),
    db.ticket.groupBy({
      by: ["status"],
      _count: true,
      where: { createdAt: { gte: fromSafe, lte: toSafe } },
    }),
    db.ticket.findMany({
      where: {
        status: { in: ["RESOLVED", "CLOSED"] },
        resolvedAt: { not: null },
        createdAt: { gte: fromSafe, lte: toSafe },
      },
      select: { createdAt: true, resolvedAt: true, slaBreached: true },
    }),
    db.order.findMany({
      where: { createdAt: { gte: fromSafe, lte: toSafe }, status: { notIn: ["CANCELLED"] } },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const avgResolutionMs =
    resolvedTickets.length > 0
      ? resolvedTickets.reduce((sum, t) => sum + (t.resolvedAt!.getTime() - t.createdAt.getTime()), 0) /
        resolvedTickets.length
      : 0;
  const avgResolutionHours = Math.round(avgResolutionMs / (1000 * 60 * 60));
  const breachedCount = resolvedTickets.filter((t) => t.slaBreached).length;
  const compliantCount = resolvedTickets.length - breachedCount;

  const msPerDay = 1000 * 60 * 60 * 24;
  const rangeDays = Math.max(1, Math.ceil((toSafe.getTime() - fromSafe.getTime()) / msPerDay) + 1);

  const dayMap: Record<string, number> = {};
  for (let i = 0; i < rangeDays; i++) {
    const day = new Date(fromSafe.getTime() + i * msPerDay);
    if (day > toSafe) break;
    const d = format(day, "dd/MM");
    dayMap[d] = 0;
  }
  for (const order of recentOrders) {
    const d = format(order.createdAt, "dd/MM");
    if (d in dayMap) dayMap[d] += Number(order.total);
  }
  const revenueData = Object.entries(dayMap)
    .filter((_, i) => i % Math.max(1, Math.floor(rangeDays / 12)) === 0)
    .map(([date, total]) => ({ date, total }));

  const statusLabels: Record<string, string> =
    locale === "sq"
      ? { OPEN: "Hapur", ASSIGNED: "Caktuar", IN_PROGRESS: "Në punë", PAUSED: "Në pauzë", PENDING_CLIENT: "Pret", RESOLVED: "Zgjidhur", CLOSED: "Mbyllur" }
      : { OPEN: "Open", ASSIGNED: "Assigned", IN_PROGRESS: "In Progress", PAUSED: "Paused", PENDING_CLIENT: "Pending", RESOLVED: "Resolved", CLOSED: "Closed" };

  const ticketChartData = ticketsByStatus.map((s) => ({
    status: s.status,
    count: s._count,
    label: statusLabels[s.status] ?? s.status,
  }));

  const fromInput = format(fromSafe, "yyyy-MM-dd");
  const toInput = format(toSafe, "yyyy-MM-dd");

  const kpis = [
    {
      title: locale === "sq" ? `Xhiro (${rangeDays}d)` : `Revenue (${rangeDays}d)`,
      value: formatPrice(Number(orderStats._sum.total ?? 0)),
      icon: TrendingUp,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      title: locale === "sq" ? "Porosi" : "Orders",
      value: orderStats._count,
      icon: BarChart3,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      title: locale === "sq" ? "Të zgjidhura" : "Resolved",
      value: resolvedTickets.length,
      icon: CheckCircle2,
      iconColor: "text-teal-600",
      iconBg: "bg-teal-50 dark:bg-teal-950/40",
    },
    {
      title: locale === "sq" ? "Ø Kohë zgjidhje" : "Avg Resolution",
      value: `${avgResolutionHours}h`,
      icon: Clock,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50 dark:bg-purple-950/40",
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={locale === "sq" ? "Raportet" : "Reports"}
        description={`${format(fromSafe, "PP")} — ${format(toSafe, "PP")}`}
        toolbar={
          <FilterBar>
            <form method="GET" action={`${lp}/admin/reports`} className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                {locale === "sq" ? "Nga" : "From"}
                <input
                  type="date"
                  name="from"
                  defaultValue={fromInput}
                  className="h-8 rounded-lg border bg-background px-2 text-sm"
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                {locale === "sq" ? "Deri" : "To"}
                <input
                  type="date"
                  name="to"
                  defaultValue={toInput}
                  className="h-8 rounded-lg border bg-background px-2 text-sm"
                />
              </label>
              <button
                type="submit"
                className="h-8 rounded-lg border bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {locale === "sq" ? "Apliko" : "Apply"}
              </button>
            </form>
          </FilterBar>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <StatCard key={k.title} {...k} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
              {locale === "sq" ? "Xhiro sipas ditës" : "Revenue by day"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              {locale === "sq" ? "Përputhshmëria SLA" : "SLA Compliance"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-4">
            <SlaRing compliant={compliantCount} breached={breachedCount} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            {locale === "sq" ? "Biletat sipas statusit" : "Tickets by status"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <TicketBarChart data={ticketChartData} />
        </CardContent>
      </Card>
    </div>
  );
}
