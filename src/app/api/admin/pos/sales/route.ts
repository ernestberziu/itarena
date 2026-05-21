import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { getFinanca5Client } from "@/lib/financa5-client";
import { generateOrderNumber } from "@/lib/utils";
import { getOrCreatePosCashClientUserId } from "@/lib/pos/cash-client";
import { getTemplateSettings } from "@/lib/templates/settings";

const itemSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
});

const bodySchema = z.object({
  items: z.array(itemSchema).min(1),
  customerType: z.enum(["registered", "cash"]),
  userId: z.string().optional(),
  paymentMethod: z.enum(["CASH"]).optional().default("CASH"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const denied = await assertAdminApiAcl(session.user.id, "pos_sale", "write");
  if (denied) return denied;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { items, customerType, userId, paymentMethod } = parsed.data;

  try {
    const client = getFinanca5Client();
    for (const item of items) {
      const product = await client.getProductByKod(item.sku);
      const available = Math.max(0, Math.round(product.stock));
      if (!product.isActive) {
        return NextResponse.json(
          { error: `Produkti "${item.name}" nuk është aktiv.` },
          { status: 400 }
        );
      }
      if (available < item.quantity) {
        return NextResponse.json(
          {
            error: `Stoku i pamjaftueshëm për "${item.name}". Disponueshëm: ${available}`,
          },
          { status: 400 }
        );
      }
    }
  } catch (erpErr) {
    console.error("[pos/sales] ERP stock check failed:", erpErr);
    return NextResponse.json(
      {
        error:
          "Financa5 API nuk është i arritshëm. Shitja nuk u regjistrua — kontrolloni stokun manualisht.",
      },
      { status: 503 }
    );
  }

  let finalUserId: string;
  let companyId: string | undefined;
  let contactPhone: string;

  if (customerType === "cash") {
    finalUserId = await getOrCreatePosCashClientUserId();
    contactPhone = "0000000000";
  } else {
    if (!userId) {
      return NextResponse.json({ error: "Klienti mungon" }, { status: 400 });
    }
    const customer = await db.user.findFirst({
      where: {
        id: userId,
        role: { in: ["CLIENT", "COMPANY_ADMIN"] },
        isActive: true,
      },
      select: { id: true, phone: true, companyId: true },
    });
    if (!customer) {
      return NextResponse.json({ error: "Klienti nuk u gjet" }, { status: 404 });
    }
    finalUserId = customer.id;
    companyId = customer.companyId ?? undefined;
    contactPhone = customer.phone?.trim() || "0000000000";
  }

  const settings = await getTemplateSettings();
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal;
  const now = new Date();
  const orderNumber = generateOrderNumber();

  const order = await db.order.create({
    data: {
      orderNumber,
      userId: finalUserId,
      companyId,
      channel: "POS",
      soldById: session.user.id,
      paymentMethod,
      items: JSON.stringify(items),
      subtotal,
      total,
      status: "DELIVERED",
      deliveryAddress: "POS — IT Arena",
      deliveryCity: settings.companyAddress.split(",")[0]?.trim() || "Tiranë",
      contactPhone,
      deliveredAt: now,
      confirmedAt: now,
    },
  });

  const { emitNotificationSafe } = await import("@/lib/notifications");
  emitNotificationSafe({
    type: "ORDER_PLACED",
    actorId: session.user.id,
    entity: { type: "order", id: order.id },
    payload: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      title: order.orderNumber,
    },
  });

  return NextResponse.json(
    { id: order.id, orderNumber: order.orderNumber },
    { status: 201 }
  );
}
