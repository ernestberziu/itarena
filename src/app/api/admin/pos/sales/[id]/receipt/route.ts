import {  NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { parseFulfillmentItems } from "@/lib/order-fulfillment";
import { buildPosReceiptHtml } from "@/lib/pos/build-receipt-html";
import { getTemplateSettings } from "@/lib/templates/settings";
import { POS_CASH_CLIENT_EMAIL, posCashClientDisplayName } from "@/lib/pos/cash-client";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiErr(req, "unauthorized", 401);
  }
  const denied = await assertAdminApiAcl(session.user.id, "pos_sale", "read");
  if (denied) return denied;

  const { id } = await params;
  const langParam = new URL(req.url).searchParams.get("lang");
  const locale = langParam === "en" ? "en" : "sq";
  const autoprint = new URL(req.url).searchParams.get("autoprint") === "1";

  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      soldBy: { select: { firstName: true, lastName: true } },
    },
  });

  if (!order || order.channel !== "POS") {
    return apiErr(req, "notFound", 404);
  }

  const settings = await getTemplateSettings();
  const items = parseFulfillmentItems(order.items);
  const isCashClient = order.user.email === POS_CASH_CLIENT_EMAIL;
  const customerLabel = isCashClient
    ? posCashClientDisplayName(locale)
    : `${order.user.firstName} ${order.user.lastName}`.trim();
  const cashierName = order.soldBy
    ? `${order.soldBy.firstName} ${order.soldBy.lastName}`.trim()
    : "—";

  const html = buildPosReceiptHtml({
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    items,
    subtotal: Number(order.subtotal),
    total: Number(order.total),
    paymentMethod: order.paymentMethod ?? "CASH",
    cashierName,
    customerLabel,
    isCashClient,
    settings,
    locale,
    autoprint,
  });

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="${order.orderNumber}-receipt.html"`,
    },
  });
}
