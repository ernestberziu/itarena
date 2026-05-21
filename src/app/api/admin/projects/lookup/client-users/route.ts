import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import type { ProjectLookupItem } from "@/lib/projects/lookup-types";
import { parseLookupLimit } from "@/lib/projects/lookup-types";

const CLIENT_ROLES = ["CLIENT", "COMPANY_ADMIN"] as const;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "projects", "read");
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const limit = parseLookupLimit(searchParams);

  if (q.length < 2) return NextResponse.json([]);

  const users = await db.user.findMany({
    where: {
      role: { in: [...CLIENT_ROLES] },
      OR: [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { email: { contains: q } },
      ],
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      company: { select: { name: true } },
    },
    take: limit,
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });

  const items: ProjectLookupItem[] = users.map((u) => ({
    id: u.id,
    label: `${u.firstName} ${u.lastName}`.trim(),
    sublabel: u.email ?? undefined,
    meta: u.company?.name ?? undefined,
  }));

  return NextResponse.json(items);
}
