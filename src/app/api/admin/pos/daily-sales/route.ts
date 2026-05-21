import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { getTodayCalendarDate } from "@/lib/calendar/dates";
import { loadPosDailySales } from "@/lib/pos/daily-sales";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiErr(req, "unauthorized", 401);
  }
  if (session.user.role !== "ADMIN") {
    return apiErr(req, "forbidden", 403);
  }

  const dateParam = new URL(req.url).searchParams.get("date")?.trim();
  const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : getTodayCalendarDate();

  try {
    const payload = await loadPosDailySales(date);
    return NextResponse.json(payload);
  } catch (e) {
    console.error("[pos/daily-sales]", e);
    return NextResponse.json({ error: "Failed to load report" }, { status: 500 });
  }
}
