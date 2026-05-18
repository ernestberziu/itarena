import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { paginatedResponse, parseListPageParams } from "@/lib/admin-list-pagination";
import { adminOrdersListWhere, mapOrderToAdminRow } from "@/lib/admin-orders-list-dto";

const orderInclude = {
  user: { select: { firstName: true, lastName: true } },
  company: { select: { name: true } },
} as const;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const denied = await assertAdminApiAcl(session.user.id, "orders", "read");
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const { page, pageSize, skip } = parseListPageParams(searchParams);
  const where = adminOrdersListWhere({
    q: searchParams.get("q"),
    status: searchParams.get("status"),
    userId: searchParams.get("userId"),
  });

  try {
    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: orderInclude,
        skip,
        take: pageSize,
      }),
      db.order.count({ where }),
    ]);

    const items = orders.map(mapOrderToAdminRow);
    return NextResponse.json(paginatedResponse(items, total, page, pageSize));
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
