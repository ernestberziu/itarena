import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { portalUser, PORTAL_ROLES } from "@/lib/portal/access";
import { portalProjectClientWhere } from "@/lib/portal/scope";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!PORTAL_ROLES.includes(session.user.role as (typeof PORTAL_ROLES)[number])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = portalUser(session);
  const links = await db.projectClient.findMany({
    where: portalProjectClientWhere(user),
    select: {
      project: {
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          updatedAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const seen = new Set<string>();
  const projects = links
    .map((l) => l.project)
    .filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

  return NextResponse.json(projects);
}
