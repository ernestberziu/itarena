import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { canReplyToReport } from "@/lib/calendar/access";
import { createStaffDailyReportReply, getReportById } from "@/lib/calendar/queries";
import { createReplySchema } from "@/lib/calendar/schemas";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiErr(req, "unauthorized", 401);
  }

  const denied = await assertAdminApiAcl(session.user.id, "calendar", "write");
  if (denied) return denied;

  if (!canReplyToReport(session.user.role)) {
    return apiErr(req, "forbidden", 403);
  }

  const { id: reportId } = await params;
  const report = await getReportById(reportId);
  if (!report) {
    return apiErr(req, "notFound", 404);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiErr(req, "invalidJson", 400);
  }

  const parsed = createReplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const reply = await createStaffDailyReportReply(
    reportId,
    session.user.id,
    parsed.data.body
  );
  return NextResponse.json(reply);
}
