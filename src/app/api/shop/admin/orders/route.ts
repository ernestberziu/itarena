import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const ADMIN_ROLES = ["ADMIN", "OPS"];

async function requireAdmin() {
  const session = await auth();
  if (!session || !ADMIN_ROLES.includes(session.user.role)) return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  const order = await db.order.update({
    where: { id },
    data: {
      status,
      ...(staffNotes !== undefined ? { staffNotes } : {}),
      ...(timestampField[status] ? { [timestampField[status]]: new Date() } : {}),
    },
  });

  return NextResponse.json(order);
}
