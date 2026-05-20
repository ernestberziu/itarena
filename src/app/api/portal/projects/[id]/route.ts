import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { portalUser } from "@/lib/portal/access";
import { assertPortalProjectAccess } from "@/lib/portal/project-access";
import { PORTAL_ROLES } from "@/lib/portal/access";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!PORTAL_ROLES.includes(session.user.role as (typeof PORTAL_ROLES)[number])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const user = portalUser(session);
  const allowed = await assertPortalProjectAccess(user, id);
  if (!allowed) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const project = await db.project.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      steps: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          sortOrder: true,
          title: true,
          description: true,
          status: true,
          clientVisible: true,
          updatedAt: true,
        },
      },
      messages: {
        where: { isInternal: false },
        orderBy: { createdAt: "asc" },
        take: 20,
        select: {
          id: true,
          body: true,
          createdAt: true,
          author: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(project);
}
