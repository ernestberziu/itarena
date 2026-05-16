import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { generateOrderNumber } from "@/lib/utils";

const orderItemSchema = z.object({
  productId: z.string(),
  sku: z.string(),
  name: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
});

const createSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  deliveryAddress: z.string().min(5),
  deliveryCity: z.string().min(2),
  contactPhone: z.string().min(6),
  deliveryNotes: z.string().optional(),
  total: z.number().positive(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { items, deliveryAddress, deliveryCity, contactPhone, deliveryNotes, total } =
    parsed.data;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await db.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: session.user.id,
      companyId: session.user.companyId ?? undefined,
      items: JSON.stringify(items),
      subtotal,
      total,
      deliveryAddress,
      deliveryCity,
      contactPhone,
      deliveryNotes: deliveryNotes ?? null,
      status: "PLACED",
    },
  });

  // Stock is authoritative in Financa5; portal orders do not mutate a local catalog.

  // Audit log
  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "CREATE",
      resource: "Order",
      resourceId: order.id,
    },
  });

  // TODO: Send confirmation email + ops notification

  return NextResponse.json({ id: order.id, orderNumber: order.orderNumber }, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isStaff = ["ADMIN", "OPS"].includes(session.user.role);

  if (isStaff) {
    const denied = await assertAdminApiAcl(session.user.id, "orders", "read");
    if (denied) return denied;
  }

  const orders = await db.order.findMany({
    where: isStaff ? {} : { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
