import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { activeStaffWhere } from "@/lib/staff/active-staff-where";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "staff", "read");
  if (denied) return denied;

  const { id: userId } = await params;
  const user = await db.user.findFirst({
    where: { id: userId, ...activeStaffWhere() },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const members = await db.projectMember.findMany({
    where: { userId },
    include: {
      project: { select: { id: true, title: true, status: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(
    members.map((m) => ({
      id: m.id,
      access: m.access,
      project: m.project,
    }))
  );
}
