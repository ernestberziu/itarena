import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateQuoteNumber } from "@/lib/utils";
import { getFinanca5Client } from "@/lib/financa5-client";

const bodySchema = z.object({
  /** ERP article code (KOD); preferred over legacy `productId`. */
  sku: z.string().min(1).optional(),
  /** @deprecated Same as `sku` (shop product URLs use kod as id). */
  productId: z.string().min(1).optional(),
  productName: z.string(),
  quantity: z.number().int().positive(),
  name: z.string().min(2),
  company: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Të dhënat janë të pavlefshme" }, { status: 400 });
    }

    const { sku, productId, productName, quantity, name, company, email, phone, notes } = parsed.data;
    const kod = (sku ?? productId)?.trim();
    if (!kod) {
      return NextResponse.json({ error: "Mungon sku (kodi ERP)" }, { status: 400 });
    }

    let erpProduct;
    try {
      erpProduct = await getFinanca5Client().getProductByKod(kod);
    } catch {
      return NextResponse.json({ error: "Produkti nuk u gjet" }, { status: 404 });
    }

    if (!erpProduct.isActive) {
      return NextResponse.json({ error: "Produkti nuk është aktiv" }, { status: 400 });
    }

    const unitPriceExVat = erpProduct.price;
    const lineTotal = unitPriceExVat * quantity;
    const displayName = productName?.trim() || erpProduct.name;

    const session = await auth();

    let requestedById = session?.user?.id;
    if (!requestedById) {
      let user = await db.user.findUnique({ where: { email } });
      if (!user) {
        const { hash } = await import("bcryptjs");
        const nameParts = name.trim().split(/\s+/);
        const firstName = nameParts[0] ?? "Klient";
        const lastName = nameParts.slice(1).join(" ") || "—";
        user = await db.user.create({
          data: {
            email,
            firstName,
            lastName,
            phone,
            role: "CLIENT",
            passwordHash: await hash(Math.random().toString(36), 10),
            isActive: true,
          },
        });
      }
      requestedById = user.id;
    }

    const quote = await db.quote.create({
      data: {
        quoteNumber: generateQuoteNumber(),
        requestedById,
        contactName: name,
        contactEmail: email,
        contactPhone: phone,
        companyName: company,
        title: `Ofertë B2B — ${displayName} × ${quantity}`,
        description: `SKU: ${kod}\nProdukt: ${displayName}\nSasi: ${quantity}\nShënime: ${notes ?? ""}`,
        services: JSON.stringify([]),
        attachments: JSON.stringify([]),
        lineItems: JSON.stringify([
          {
            sku: kod,
            productName: displayName,
            quantity,
            unitPrice: unitPriceExVat,
            total: lineTotal,
          },
        ]),
        status: "PENDING",
      },
    });

    const { emitNotificationSafe } = await import("@/lib/notifications");
    emitNotificationSafe({
      type: "SHOP_QUOTE_SUBMITTED",
      actorId: requestedById ?? null,
      entity: { type: "quote", id: quote.id },
      payload: {
        quoteId: quote.id,
        quoteNumber: quote.quoteNumber,
        title: quote.title,
        companyName: company,
      },
    });

    return NextResponse.json({ id: quote.id, quoteNumber: quote.quoteNumber }, { status: 201 });
  } catch (error) {
    console.error("Shop quote error:", error);
    return NextResponse.json({ error: "Gabim i serverit" }, { status: 500 });
  }
}
