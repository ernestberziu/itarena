import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminClientsListWhere } from "@/lib/admin-clients-list-where";
import { mapClientToAdminRow } from "@/lib/admin-clients-list-dto";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { paginatedResponse, parseListPageParams } from "@/lib/admin-list-pagination";

const clientInclude = {
  company: { select: { name: true, tier: true, isApproved: true } },
  _count: { select: { tickets: true, orders: true } },
} as const;

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
  const { page, pageSize, skip } = parseListPageParams(searchParams);
  const where = adminClientsListWhere({
    q: searchParams.get("q"),
    tier: searchParams.get("tier"),
    approved: searchParams.get("approved"),
    active: searchParams.get("active") ?? "all",
  });

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      include: clientInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.user.count({ where }),
  ]);

  const items = users.map(mapClientToAdminRow);
  return NextResponse.json(paginatedResponse(items, total, page, pageSize));
}
