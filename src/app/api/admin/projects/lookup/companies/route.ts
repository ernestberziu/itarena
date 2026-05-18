import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import type { ProjectLookupItem } from "@/lib/projects/lookup-types";
import { parseLookupLimit } from "@/lib/projects/lookup-types";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "projects", "read");
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const limit = parseLookupLimit(searchParams);

  if (q.length < 2) return NextResponse.json([]);

  const companies = await db.company.findMany({
    where: {
      OR: [{ name: { contains: q } }, { vatNumber: { contains: q } }],
    },
    select: { id: true, name: true, vatNumber: true, tier: true },
    take: limit,
    orderBy: { name: "asc" },
  });

  const items: ProjectLookupItem[] = companies.map((c) => ({
    id: c.id,
    label: c.name,
    sublabel: c.vatNumber ?? undefined,
    meta: c.tier,
  }));

  return NextResponse.json(items);
}
