import {  NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { isCalendarAdmin } from "@/lib/calendar/access";
import { getActiveStaffRoster } from "@/lib/calendar/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return apiErr("sq", "unauthorized", 401);
  }

  const denied = await assertAdminApiAcl(session.user.id, "calendar", "read");
  if (denied) return denied;

  if (!isCalendarAdmin(session.user.role)) {
    return apiErr("sq", "forbidden", 403);
  }

  const staff = await getActiveStaffRoster();
  return NextResponse.json(staff);
}
