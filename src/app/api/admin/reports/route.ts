import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { subDays, startOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");

  const from = fromStr ? new Date(fromStr) : startOfDay(subDays(new Date(), 30));
  const to = toStr ? new Date(toStr) : new Date();

  const [orderStats, ticketStats, slaStats] = await Promise.all([
    db.order.groupBy({
      by: ["status"],
      _count: true,
      _sum: { total: true },
      where: { createdAt: { gte: from, lte: to } },
    }),
    db.ticket.groupBy({
      by: ["status", "priority"],
      _count: true,
      where: { createdAt: { gte: from, lte: to } },
    }),
    db.ticket.findMany({
      where: {
        createdAt: { gte: from, lte: to },
        status: { in: ["RESOLVED", "CLOSED"] },
        resolvedAt: { not: null },
      },
      select: { createdAt: true, resolvedAt: true, slaBreached: true },
    }),
  ]);

  const avgResolutionMs = slaStats.length > 0
    ? slaStats.reduce((sum, t) => {
        const ms = t.resolvedAt!.getTime() - t.createdAt.getTime();
        return sum + ms;
      }, 0) / slaStats.length
    : 0;

  const breachedCount = slaStats.filter((t) => t.slaBreached).length;

  return NextResponse.json({
    orders: orderStats,
    tickets: ticketStats,
    resolution: {
      avgHours: Math.round(avgResolutionMs / (1000 * 60 * 60)),
      total: slaStats.length,
      breached: breachedCount,
      compliant: slaStats.length - breachedCount,
    },
  });
}
