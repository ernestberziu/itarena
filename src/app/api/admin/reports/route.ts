import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { subDays, startOfDay } from "date-fns";
import { isSlaBreached } from "@/lib/sla";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiErr(req, "unauthorized", 401);
  }
  const denied = await assertAdminApiAcl(session.user.id, "reports", "read");
  if (denied) return denied;

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
      select: { createdAt: true, resolvedAt: true, slaDeadline: true, status: true },
    }),
  ]);

  const avgResolutionMs = slaStats.length > 0
    ? slaStats.reduce((sum, t) => {
        const ms = t.resolvedAt!.getTime() - t.createdAt.getTime();
        return sum + ms;
      }, 0) / slaStats.length
    : 0;

  const breachedCount = slaStats.filter((t) =>
    isSlaBreached({
      slaDeadline: t.slaDeadline,
      status: t.status,
      resolvedAt: t.resolvedAt,
    })
  ).length;

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
