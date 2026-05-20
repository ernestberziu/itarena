import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { STAFF_ROLES } from "@/types/domain";

const CLIENT_ROLES = ["CLIENT", "COMPANY_ADMIN"] as const;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "messages", "read");
  if (denied) return denied;

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);

  const allowedRoles = [...STAFF_ROLES, ...CLIENT_ROLES];

  const users = await db.user.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      id: { not: session.user.id },
      role: { in: allowedRoles },
      OR: [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      company: { select: { name: true } },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    take: 20,
  });

  return NextResponse.json(
    users.map((u) => ({
      id: u.id,
      label: `${u.firstName} ${u.lastName}`.trim(),
      sublabel: u.email,
      meta: STAFF_ROLES.includes(u.role as (typeof STAFF_ROLES)[number]) ? "staff" : "client",
      companyName: u.company?.name ?? undefined,
    }))
  );
}
