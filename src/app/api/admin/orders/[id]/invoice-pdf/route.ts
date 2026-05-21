import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { buildOrderInvoicePdfBuffer } from "@/lib/orders/export-order-invoice-pdf";
import { getTemplateSettings } from "@/lib/templates/settings";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const denied = await assertAdminApiAcl(session.user.id, "orders", "read");
  if (denied) return denied;

  const { id } = await params;
  const langParam = new URL(req.url).searchParams.get("lang");
  const language = langParam === "en" ? "en" : "sq";

  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true } },
      company: { select: { name: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const settings = await getTemplateSettings();
    const { buffer, filename } = await buildOrderInvoicePdfBuffer({
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
      subtotal: String(order.subtotal),
      total: String(order.total),
      itemsJson: order.items,
      deliveryAddress: order.deliveryAddress,
      deliveryCity: order.deliveryCity,
      deliveryNotes: order.deliveryNotes,
      contactPhone: order.contactPhone,
      user: order.user,
      company: order.company,
      language,
      settings,
    });

    return new NextResponse(buffer.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to generate invoice PDF" }, { status: 500 });
  }
}
