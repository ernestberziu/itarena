import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminClientsListWhere } from "@/lib/admin-clients-list-where";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = ["ADMIN", "SALES"];
  if (!allowed.includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const denied = await assertAdminApiAcl(session.user.id, "clients", "read");
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const where = adminClientsListWhere({
    q: searchParams.get("q"),
    tier: searchParams.get("tier"),
    approved: searchParams.get("approved"),
    active: searchParams.get("active") ?? "all",
  });

  const users = await db.user.findMany({
    where,
    include: {
      company: {
        select: { name: true, tier: true, isApproved: true },
      },
      _count: {
        select: { tickets: true, orders: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}
