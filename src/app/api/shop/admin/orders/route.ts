import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";

const ADMIN_ROLES = ["ADMIN", "OPS"];

async function requireShopOrdersStaff() {
  const session = await auth();
  if (!session?.user?.id || !ADMIN_ROLES.includes(session.user.role)) return null;
  const denied = await assertAdminApiAcl(session.user.id, "shop_orders", "read");
  if (denied) return { error: denied };
  return { session };
}

async function requireShopOrdersWrite() {
  const session = await auth();
  if (!session?.user?.id || !ADMIN_ROLES.includes(session.user.role)) return null;
  const denied = await assertAdminApiAcl(session.user.id, "shop_orders", "write");
  if (denied) return { error: denied };
  return { session };
}

export async function GET() {
  const result = await requireShopOrdersStaff();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ("error" in result) return result.error;

  const orders = await db.order.findMany({
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    orders.map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      total: Number(o.total),
      items: (() => { try { return JSON.parse(o.items); } catch { return []; } })(),
    }))
  );
}

export async function PATCH(req: NextRequest) {
  const result = await requireShopOrdersWrite();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ("error" in result) return result.error;

  const { id, status, staffNotes } = await req.json();
  if (!id || !status) {
    return NextResponse.json({ error: "id and status required" }, { status: 400 });
  }

  const validStatuses = ["PLACED", "CONFIRMED", "DISPATCHED", "DELIVERED", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Status i pavlefshëm" }, { status: 400 });
  }

  const timestampField: Record<string, string> = {
    CONFIRMED: "confirmedAt",
    DISPATCHED: "dispatchedAt",
    DELIVERED: "deliveredAt",
    CANCELLED: "cancelledAt",
  };

  const existing = await db.order.findUnique({
    where: { id },
    select: { status: true, orderNumber: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const order = await db.order.update({
    where: { id },
    data: {
      status,
      ...(staffNotes !== undefined ? { staffNotes } : {}),
      ...(timestampField[status] ? { [timestampField[status]]: new Date() } : {}),
    },
  });

  if (status !== existing.status) {
    const { emitNotificationSafe } = await import("@/lib/notifications");
    emitNotificationSafe({
      type: "ORDER_STATUS_CHANGED",
      actorId: result.session.user.id,
      entity: { type: "order", id },
      dedupeKey: `order:${id}:status:${status}`,
      payload: {
        orderId: id,
        orderNumber: existing.orderNumber,
        status,
        oldStatus: existing.status,
      },
    });
  }

  return NextResponse.json(order);
}
