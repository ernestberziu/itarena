import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { absoluteUrl } from "@/lib/email/brand";
import { sendOrderClientSummaryEmail } from "@/lib/email/transactional";

type Params = { params: Promise<{ id: string }> };

type OrderItem = { name?: string; title?: string; quantity?: number; qty?: number };

function formatOrderItems(itemsJson: string): string {
  try {
    const items = JSON.parse(itemsJson) as OrderItem[];
    if (!Array.isArray(items)) return "";
    return items
      .map((it) => {
        const name = it.name ?? it.title ?? "Item";
        const qty = it.quantity ?? it.qty ?? 1;
        return `• ${name} × ${qty}`;
      })
      .join("\n");
  } catch {
    return "";
  }
}

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(_req, "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "orders", "read");
  if (denied) return denied;

  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, firstName: true, lastName: true, language: true } },
    },
  });

  if (!order?.user.email) {
    return NextResponse.json({ error: "Client has no email" }, { status: 400 });
  }

  const locale = order.user.language === "en" ? "en" : "sq";
  const clientName = `${order.user.firstName} ${order.user.lastName}`.trim();
  const totalFormatted = `${Number(order.total).toFixed(2)} ALL`;

  const mail = await sendOrderClientSummaryEmail({
    to: order.user.email,
    clientName,
    orderNumber: order.orderNumber,
    status: order.status,
    totalFormatted,
    itemSummary: formatOrderItems(order.items),
    locale,
    portalOrderUrl: absoluteUrl(`/${locale}/portal/orders`),
  });

  return NextResponse.json({ ok: true, emailSent: mail.sent });
}
