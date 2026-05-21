import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { isCalendarAdmin } from "@/lib/calendar/access";
import { calendarDayQuerySchema } from "@/lib/calendar/schemas";
import { getCalendarDay } from "@/lib/calendar/queries";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiErr(req, "unauthorized", 401);
  }

  const denied = await assertAdminApiAcl(session.user.id, "calendar", "read");
  if (denied) return denied;

  const parsed = calendarDayQuerySchema.safeParse({
    date: req.nextUrl.searchParams.get("date"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const payload = await getCalendarDay(
    parsed.data.date,
    session.user.id,
    isCalendarAdmin(session.user.role)
  );
  return NextResponse.json(payload);
}
