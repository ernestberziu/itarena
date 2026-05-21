import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { getFinanca5Client } from "@/lib/financa5-client";

const itemSchema = z.object({
  // sku is the ERP article code (ARTIKUJ.KOD) — used to look up live stock
  sku:      z.string().min(1),
  name:     z.string(),
  quantity: z.number().int().positive(),
  price:    z.number().positive(),
});

const bodySchema = z.object({
  items:           z.array(itemSchema).min(1),
  customerName:    z.string().min(2),
  deliveryAddress: z.string().min(5),
  deliveryCity:    z.string().min(2),
  contactPhone:    z.string().min(7),
  deliveryNotes:   z.string().optional(),
  total:           z.number().positive(),
  isB2b:           z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Të dhënat janë të pavlefshme", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      items, customerName, deliveryAddress, deliveryCity,
      contactPhone, deliveryNotes, total,
    } = parsed.data;

    // ── Validate stock live from Financa5Api ───────────────────────────────
    // The ERP is the single source of truth for availability.
    // We never decrement stock in Prisma — the ERP manages inventory.
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
      // If the ERP API is unreachable, log and allow the order through
      // (staff will verify manually). Do not block the sale.
      console.warn("[checkout] ERP stock check failed — proceeding anyway:", erpErr);
    }

    // ── Resolve user (session or guest) ──────────────────────────────────────
    const session    = await auth();
    const userId     = session?.user?.id;
    const companyId  = session?.user?.companyId ?? undefined;

    let finalUserId = userId;
    if (!finalUserId) {
      const guestEmail = `guest_${contactPhone.replace(/\D/g, "")}@guest.itarena.al`;
      let guestUser = await db.user.findUnique({ where: { email: guestEmail } });
      if (!guestUser) {
        const { hash } = await import("bcryptjs");
        guestUser = await db.user.create({
          data: {
            email:        guestEmail,
            firstName:    customerName.split(" ")[0] ?? customerName,
            lastName:     customerName.split(" ").slice(1).join(" ") || "-",
            phone:        contactPhone,
            role:         "CLIENT",
            passwordHash: await hash(Math.random().toString(36), 10),
            isActive:     true,
          },
        });
      }
      finalUserId = guestUser.id;
    }

    // ── Save order to Prisma (orders table only) ──────────────────────────────
    const subtotal    = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const orderNumber = generateOrderNumber();

    const order = await db.order.create({
      data: {
        orderNumber,
        userId:          finalUserId,
        companyId,
        items:           JSON.stringify(items),
        subtotal,
        total,
        deliveryAddress,
        deliveryCity,
        contactPhone,
        deliveryNotes:   deliveryNotes ?? null,
        status:          "PLACED",
        staffNotes:      `Klient: ${customerName}`,
      },
    });

    const { emitNotificationSafe } = await import("@/lib/notifications");
    emitNotificationSafe({
      type: "ORDER_PLACED",
      actorId: finalUserId,
      entity: { type: "order", id: order.id },
      payload: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        title: order.orderNumber,
      },
    });

    return NextResponse.json(
      { orderNumber: order.orderNumber, id: order.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Shop checkout error:", error);
    return NextResponse.json({ error: "Gabim i serverit" }, { status: 500 });
  }
}
