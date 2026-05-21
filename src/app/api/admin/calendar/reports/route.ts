import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { canSubmitReportForDate } from "@/lib/calendar/access";
import { isFutureCalendarDate } from "@/lib/calendar/dates";
import { upsertStaffDailyReport } from "@/lib/calendar/queries";
import { upsertReportSchema } from "@/lib/calendar/schemas";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiErr(req, "unauthorized", 401);
  }

  const denied = await assertAdminApiAcl(session.user.id, "calendar", "write");
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiErr(req, "invalidJson", 400);
  }

  const parsed = upsertReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { date, body: reportBody } = parsed.data;
  const isFuture = isFutureCalendarDate(date);
  if (!canSubmitReportForDate(session.user.id, session.user.id, isFuture)) {
    return NextResponse.json({ error: "Cannot submit for this date" }, { status: 403 });
  }

  const report = await upsertStaffDailyReport(session.user.id, date, reportBody);
  return NextResponse.json(report);
}
