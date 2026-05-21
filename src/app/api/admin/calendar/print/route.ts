import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { isCalendarAdmin } from "@/lib/calendar/access";
import { calendarPrintQuerySchema } from "@/lib/calendar/schemas";
import { getCalendarPrintData } from "@/lib/calendar/queries";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiErr(req, "unauthorized", 401);
  }

  const denied = await assertAdminApiAcl(session.user.id, "calendar", "read");
  if (denied) return denied;

  if (!isCalendarAdmin(session.user.role)) {
    return apiErr(req, "forbidden", 403);
  }

  const parsed = calendarPrintQuerySchema.safeParse({
    year: req.nextUrl.searchParams.get("year"),
    month: req.nextUrl.searchParams.get("month"),
    userIds: req.nextUrl.searchParams.get("userIds") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const payload = await getCalendarPrintData(
    parsed.data.year,
    parsed.data.month,
    parsed.data.userIds.length > 0 ? parsed.data.userIds : undefined
  );
  return NextResponse.json(payload);
}
