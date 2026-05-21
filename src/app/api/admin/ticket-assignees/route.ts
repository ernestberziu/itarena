import {  NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { activeStaffMemberWhere } from "@/lib/staff/active-staff-where";
import { isStaff } from "@/types/domain";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiErr("sq", "unauthorized", 401);
  if (!isStaff(session.user.role)) {
    return apiErr("sq", "forbidden", 403);
  }
  const denied = await assertAdminApiAcl(session.user.id, "tickets", "read");
  if (denied) return denied;

  const users = await db.user.findMany({
    where: activeStaffMemberWhere(),
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });

  return NextResponse.json(users);
}
