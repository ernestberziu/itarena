import { db } from "@/lib/db";
import { pctDelta, previousRange, rangeToDates } from "./date-range";
import type { ReportRange } from "./types";
import {
  addToBucket,
  buildDailyBuckets,
  CLIENT_ROLES,
  decimal,
  mapToDailyPoints,
  parseOrderItems,
} from "./helpers";
import { buildInsights } from "./insights";
import type {
  KpiCard,
  KpiKey,
  ReportsOverviewPayload,
} from "./types";

const OPEN_QUOTE_STATUSES = ["PENDING", "REVIEWING", "SENT", "REVISION_REQUESTED"];
const FUNNEL_QUOTE_STAGES = ["PENDING", "REVIEWING", "SENT", "ACCEPTED"] as const;

async function fetchPeriodMetrics(from: Date, to: Date) {
  const orderWhere = {
    createdAt: { gte: from, lte: to },
    status: { not: "CANCELLED" as const },
  };
  const clientWhere = { role: { in: [...CLIENT_ROLES] } };

  const [
    orderAgg,
    orderCount,
    ordersForSeries,
    ordersByStatus,
    ordersWithCompany,
    newCustomers,
    activeCustomers,
    signups,
    quotesAll,
    quotesAccepted,
    quotePipeline,
    ticketsResolved,
    ticketsOpened,
    ticketsForSla,
    auditLogs,
    orderUserGroups,
    allOrdersInRange,
  ] = await Promise.all([
    db.order.aggregate({ where: orderWhere, _sum: { total: true } }),
    db.order.count({ where: orderWhere }),
    db.order.findMany({
      where: orderWhere,
      select: { createdAt: true, total: true },
    }),
    db.order.groupBy({
      by: ["status"],
      where: { createdAt: { gte: from, lte: to } },
      _count: true,
      _sum: { total: true },
    }),
    db.order.findMany({
      where: orderWhere,
      select: { total: true, company: { select: { name: true, tier: true, country: true } } },
    }),
    db.user.count({
      where: { ...clientWhere, createdAt: { gte: from, lte: to } },
    }),
    db.user.count({
      where: { ...clientWhere, lastLoginAt: { gte: from, lte: to } },
    }),
    db.user.findMany({
      where: { ...clientWhere, createdAt: { gte: from, lte: to } },
      select: { createdAt: true },
    }),
    db.quote.count({ where: { createdAt: { gte: from, lte: to } } }),
    db.quote.count({
      where: { createdAt: { gte: from, lte: to }, status: "ACCEPTED" },
    }),
    db.quote.findMany({
      where: {
        createdAt: { gte: from, lte: to },
        status: { in: OPEN_QUOTE_STATUSES },
      },
      select: { total: true },
    }),
    db.ticket.count({
      where: {
        resolvedAt: { gte: from, lte: to },
        status: { in: ["RESOLVED", "CLOSED"] },
      },
    }),
    db.ticket.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: { createdAt: true, resolvedAt: true },
    }),
    db.ticket.findMany({
      where: {
        createdAt: { gte: from, lte: to },
        status: { in: ["RESOLVED", "CLOSED"] },
        resolvedAt: { not: null },
      },
      select: { createdAt: true, resolvedAt: true, slaBreached: true },
    }),
    db.auditLog.groupBy({
      by: ["action"],
      where: { createdAt: { gte: from, lte: to } },
      _count: true,
    }),
    db.order.groupBy({
      by: ["userId"],
      where: orderWhere,
      _count: true,
    }),
    db.order.findMany({
      where: { createdAt: { gte: from, lte: to }, status: { not: "CANCELLED" } },
      select: { items: true, createdAt: true, total: true },
    }),
  ]);

  const revenue = decimal(orderAgg._sum.total);
  const revenueMap = buildDailyBuckets(from, to);
  for (const o of ordersForSeries) {
    addToBucket(revenueMap, o.createdAt, decimal(o.total));
  }

  const signupMap = buildDailyBuckets(from, to);
  for (const u of signups) {
    addToBucket(signupMap, u.createdAt, 1);
  }

  const openedMap = buildDailyBuckets(from, to);
  const resolvedMap = buildDailyBuckets(from, to);
  for (const t of ticketsOpened) {
    addToBucket(openedMap, t.createdAt, 1);
    if (t.resolvedAt && t.resolvedAt >= from && t.resolvedAt <= to) {
      addToBucket(resolvedMap, t.resolvedAt, 1);
    }
  }

  const tierTotals = new Map<string, number>();
  const countryCounts = new Map<string, number>();
  const companyRevenue = new Map<string, { revenue: number; orders: number }>();

  for (const o of ordersWithCompany) {
    const tier = o.company?.tier ?? "RETAIL";
    tierTotals.set(tier, (tierTotals.get(tier) ?? 0) + decimal(o.total));
    const country = o.company?.country?.trim();
    if (country) countryCounts.set(country, (countryCounts.get(country) ?? 0) + 1);
    const name = o.company?.name ?? "—";
    const cur = companyRevenue.get(name) ?? { revenue: 0, orders: 0 };
    companyRevenue.set(name, {
      revenue: cur.revenue + decimal(o.total),
      orders: cur.orders + 1,
    });
  }

  const skuMap = new Map<string, { name: string; quantity: number; revenue: number }>();
  for (const o of allOrdersInRange) {
    for (const line of parseOrderItems(o.items)) {
      const sku = (line.sku ?? line.productId ?? "unknown").trim();
      const qty = line.quantity ?? 1;
      const rev = (line.price ?? 0) * qty;
      const cur = skuMap.get(sku) ?? { name: line.name ?? sku, quantity: 0, revenue: 0 };
      skuMap.set(sku, {
        name: cur.name,
        quantity: cur.quantity + qty,
        revenue: cur.revenue + rev,
      });
    }
  }

  const quotesByStatus = await db.quote.groupBy({
    by: ["status"],
    where: { createdAt: { gte: from, lte: to } },
    _count: true,
  });

  const respondedQuotes = await db.quote.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      respondedAt: { not: null },
    },
    select: { createdAt: true, respondedAt: true },
  });

  let avgResponseMs = 0;
  if (respondedQuotes.length > 0) {
    avgResponseMs =
      respondedQuotes.reduce(
        (s, q) => s + (q.respondedAt!.getTime() - q.createdAt.getTime()),
        0
      ) / respondedQuotes.length;
  }

  const slaBreached = ticketsForSla.filter((t) => t.slaBreached).length;
  const slaCompliant = ticketsForSla.length - slaBreached;
  const avgResolutionMs =
    ticketsForSla.length > 0
      ? ticketsForSla.reduce(
          (s, t) => s + (t.resolvedAt!.getTime() - t.createdAt.getTime()),
          0
        ) / ticketsForSla.length
      : 0;

  const cancelledCount = ordersByStatus.find((s) => s.status === "CANCELLED")?._count ?? 0;
  const completedCount =
    ordersByStatus
      .filter((s) => s.status === "DELIVERED" || s.status === "CONFIRMED")
      .reduce((s, x) => s + x._count, 0) ?? 0;

  const pipelineValue = quotePipeline.reduce((s, q) => s + decimal(q.total), 0);
  const winRate = quotesAll > 0 ? Math.round((quotesAccepted / quotesAll) * 1000) / 10 : 0;

  const ordersInPeriod = await db.order.count({
    where: { createdAt: { gte: from, lte: to } },
  });

  return {
    revenue,
    orderCount,
    revenueSparkline: mapToDailyPoints(revenueMap),
    newCustomers,
    activeCustomers,
    returningCustomers: orderUserGroups.filter((g) => g._count > 1).length,
    quotesAll,
    quotesAccepted,
    quotePipelineCount: quotePipeline.length,
    pipelineValue,
    winRate,
    ticketsResolved,
    signupSparkline: mapToDailyPoints(signupMap),
    openedSparkline: mapToDailyPoints(openedMap),
    resolvedSparkline: mapToDailyPoints(resolvedMap),
    ordersByStatus: ordersByStatus.map((s) => ({
      status: s.status,
      count: s._count,
      total: decimal(s._sum.total),
    })),
    tierTotals: Array.from(tierTotals.entries()).map(([tier, total]) => ({ tier, total })),
    countryCounts: Array.from(countryCounts.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12),
    topCompanies: Array.from(companyRevenue.entries())
      .map(([name, v]) => ({ name, revenue: v.revenue, orders: v.orders }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10),
    topSkus: Array.from(skuMap.entries())
      .map(([sku, v]) => ({ sku, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 20),
    quotesByStatus: quotesByStatus.map((s) => ({ status: s.status, count: s._count })),
    avgResponseHours: respondedQuotes.length
      ? Math.round(avgResponseMs / (1000 * 60 * 60))
      : null,
    slaCompliant,
    slaBreached,
    avgResolutionHours: Math.round(avgResolutionMs / (1000 * 60 * 60)),
    auditByAction: auditLogs.map((a) => ({ action: a.action, count: a._count })),
    funnelStages: {
      signups: newCustomers,
      quotes: quotesAll,
      quotesAccepted,
      orders: ordersInPeriod,
    },
    dailyRevenue: mapToDailyPoints(revenueMap),
    cancelledCount,
    completedCount,
  };
}

function buildKpis(
  current: Awaited<ReturnType<typeof fetchPeriodMetrics>>,
  previous: Awaited<ReturnType<typeof fetchPeriodMetrics>> | null
): KpiCard[] {
  const aov = current.orderCount > 0 ? current.revenue / current.orderCount : 0;
  const prevRevenue = previous?.revenue ?? 0;
  const growth = pctDelta(current.revenue, prevRevenue);

  const defs: {
    key: KpiKey;
    value: number;
    formatted: string;
    sparkline: typeof current.revenueSparkline;
    prev?: number;
  }[] = [
    {
      key: "revenue",
      value: current.revenue,
      formatted: formatAllStatic(current.revenue),
      sparkline: current.revenueSparkline,
      prev: prevRevenue,
    },
    {
      key: "orders",
      value: current.orderCount,
      formatted: String(current.orderCount),
      sparkline: current.revenueSparkline.map((p) => ({ ...p, value: p.value > 0 ? 1 : 0 })),
      prev: previous?.orderCount,
    },
    {
      key: "aov",
      value: aov,
      formatted: formatAllStatic(aov),
      sparkline: current.revenueSparkline,
      prev: previous && previous.orderCount > 0 ? previous.revenue / previous.orderCount : 0,
    },
    {
      key: "revenueGrowth",
      value: growth ?? 0,
      formatted: growth != null ? `${growth > 0 ? "+" : ""}${growth}%` : "—",
      sparkline: current.revenueSparkline,
    },
    {
      key: "newCustomers",
      value: current.newCustomers,
      formatted: String(current.newCustomers),
      sparkline: current.signupSparkline,
      prev: previous?.newCustomers,
    },
    {
      key: "activeCustomers",
      value: current.activeCustomers,
      formatted: String(current.activeCustomers),
      sparkline: current.signupSparkline,
      prev: previous?.activeCustomers,
    },
    {
      key: "returningCustomers",
      value: current.returningCustomers,
      formatted: String(current.returningCustomers),
      sparkline: current.signupSparkline,
      prev: previous?.returningCustomers,
    },
    {
      key: "quotePipeline",
      value: current.quotePipelineCount,
      formatted: `${current.quotePipelineCount} · ${formatAllStatic(current.pipelineValue)}`,
      sparkline: current.revenueSparkline,
      prev: previous?.quotePipelineCount,
    },
    {
      key: "quoteWinRate",
      value: current.winRate,
      formatted: `${current.winRate}%`,
      sparkline: current.revenueSparkline,
      prev: previous?.winRate,
    },
    {
      key: "ticketsResolved",
      value: current.ticketsResolved,
      formatted: String(current.ticketsResolved),
      sparkline: current.resolvedSparkline,
      prev: previous?.ticketsResolved,
    },
  ];

  return defs.map((d) => ({
    key: d.key,
    value: d.value,
    formatted: d.formatted,
    deltaPct: d.key === "revenueGrowth" ? growth : d.prev !== undefined ? pctDelta(d.value, d.prev) : null,
    sparkline: d.sparkline,
  }));
}

function formatAllStatic(amount: number): string {
  return new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency: "ALL",
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function fetchReportsOverview(
  range: ReportRange,
  compare: boolean
): Promise<ReportsOverviewPayload> {
  const { from, to } = rangeToDates(range);
  const current = await fetchPeriodMetrics(from, to);

  let previous: Awaited<ReturnType<typeof fetchPeriodMetrics>> | null = null;
  let prevRange: ReportRange | null = null;

  if (compare) {
    prevRange = previousRange(range);
    const prevDates = rangeToDates(prevRange);
    previous = await fetchPeriodMetrics(prevDates.from, prevDates.to);
  }

  const kpis = buildKpis(current, previous);

  const payload: ReportsOverviewPayload = {
    range,
    previousRange: prevRange,
    kpis,
    insights: [],
    sections: {
      revenue: {
        dailyRevenue: current.dailyRevenue,
        byStatus: current.ordersByStatus,
        byTier: current.tierTotals,
        cancelledCount: current.cancelledCount,
        completedCount: current.completedCount,
      },
      users: {
        dailySignups: current.signupSparkline,
        newCustomers: current.newCustomers,
        returningCustomers: current.returningCustomers,
        topCompanies: current.topCompanies,
        byCountry: current.countryCounts,
      },
      quotes: {
        byStatus: current.quotesByStatus,
        funnel: FUNNEL_QUOTE_STAGES.map((stage) => ({
          stage,
          count: current.quotesByStatus.find((s) => s.status === stage)?.count ?? 0,
        })),
        avgResponseHours: current.avgResponseHours,
        pipelineCount: current.quotePipelineCount,
        pipelineValue: current.pipelineValue,
      },
      products: { topSkus: current.topSkus },
      funnel: {
        stages: [
          { stage: "signups", count: current.funnelStages.signups },
          { stage: "quotes", count: current.funnelStages.quotes },
          { stage: "quotesAccepted", count: current.funnelStages.quotesAccepted },
          { stage: "orders", count: current.funnelStages.orders },
        ],
      },
      support: {
        ticketsOpenedDaily: current.openedSparkline,
        ticketsResolvedDaily: current.resolvedSparkline,
        slaCompliant: current.slaCompliant,
        slaBreached: current.slaBreached,
        avgResolutionHours: current.avgResolutionHours,
        auditByAction: current.auditByAction,
      },
    },
    generatedAt: new Date().toISOString(),
  };

  payload.insights = buildInsights(payload, compare && previous != null);
  return payload;
}
