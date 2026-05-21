import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import type { ProjectLookupItem } from "@/lib/projects/lookup-types";
import { parseLookupLimit } from "@/lib/projects/lookup-types";
import { activeStaffMemberWhere } from "@/lib/staff/active-staff-where";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "projects", "read");
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const limit = parseLookupLimit(searchParams);
  const excludeProjectId = searchParams.get("excludeProjectId")?.trim();

  if (q.length < 2) return NextResponse.json([]);

  let excludeUserIds: string[] = [];
  if (excludeProjectId) {
    const members = await db.projectMember.findMany({
      where: { projectId: excludeProjectId },
      select: { userId: true },
    });
    excludeUserIds = members.map((m) => m.userId);
  }

  const users = await db.user.findMany({
    where: {
      ...activeStaffMemberWhere(),
      ...(excludeUserIds.length > 0 ? { id: { notIn: excludeUserIds } } : {}),
      OR: [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { email: { contains: q } },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
    take: limit,
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });

  const items: ProjectLookupItem[] = users.map((u) => ({
    id: u.id,
    label: `${u.firstName} ${u.lastName}`.trim(),
    sublabel: u.email ?? undefined,
    meta: u.role,
  }));

  return NextResponse.json(items);
}
