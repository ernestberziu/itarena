import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";

const CLIENT_ROLES = ["CLIENT", "COMPANY_ADMIN"] as const;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "templates", "read");
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(30, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "20", 10) || 20));

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
      phone: true,
      companyId: true,
      company: {
        select: { id: true, name: true, vatNumber: true, address: true, city: true, country: true },
      },
    },
    take: limit,
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });

  return NextResponse.json(
    users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone,
      companyId: u.companyId,
      companyName: u.company?.name ?? null,
      vatNumber: u.company?.vatNumber ?? null,
      address: [u.company?.address, u.company?.city, u.company?.country].filter(Boolean).join(", ") || null,
    }))
  );
}
