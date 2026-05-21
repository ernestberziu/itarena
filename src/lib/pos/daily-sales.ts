import { addDays } from "date-fns";
import { db } from "@/lib/db";
import { parseCalendarDateForDb } from "@/lib/calendar/dates";
import { parseFulfillmentItems } from "@/lib/order-fulfillment";
import { POS_CASH_CLIENT_EMAIL } from "@/lib/pos/cash-client";
import type {
  PosDailySalesLineItem,
  PosDailySalesOrder,
  PosDailySalesPayload,
  PosDailySalesStaffRow,
} from "./types";

function mapOrderItems(itemsJson: string): PosDailySalesLineItem[] {
  return parseFulfillmentItems(itemsJson).map((item) => ({
    sku: item.sku ?? null,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    lineTotal: item.price * item.quantity,
  }));
}

export async function loadPosDailySales(dateStr: string): Promise<PosDailySalesPayload> {
  const start = parseCalendarDateForDb(dateStr);
  const end = addDays(start, 1);

  const orders = await db.order.findMany({
    where: {
      channel: "POS",
      createdAt: { gte: start, lt: end },
      soldById: { not: null },
      soldBy: { role: { not: "PARTNER" } },
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      orderNumber: true,
      total: true,
      items: true,
      paymentMethod: true,
      createdAt: true,
      soldById: true,
      soldBy: { select: { id: true, firstName: true, lastName: true, role: true } },
      user: { select: { firstName: true, lastName: true, email: true } },
    },
  });

  const byStaff = new Map<string, PosDailySalesStaffRow>();

  for (const o of orders) {
    if (!o.soldBy) continue;

    const sale: PosDailySalesOrder = {
      orderId: o.id,
      orderNumber: o.orderNumber,
      createdAt: o.createdAt.toISOString(),
      isCashClient: o.user.email === POS_CASH_CLIENT_EMAIL,
      customerName: `${o.user.firstName} ${o.user.lastName}`.trim(),
      paymentMethod: o.paymentMethod,
      orderTotal: Number(o.total),
      items: mapOrderItems(o.items),
    };

    const key = o.soldBy.id;
    const cur =
      byStaff.get(key) ??
      ({
        userId: o.soldBy.id,
        firstName: o.soldBy.firstName,
        lastName: o.soldBy.lastName,
        role: o.soldBy.role,
        saleCount: 0,
        total: 0,
        sales: [],
      } satisfies PosDailySalesStaffRow);

    cur.sales.push(sale);
    cur.saleCount += 1;
    cur.total += sale.orderTotal;
    byStaff.set(key, cur);
  }

  const staff = [...byStaff.values()]
    .map((row) => ({
      ...row,
      sales: row.sales.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    }))
    .sort((a, b) => b.total - a.total);

  const grandTotal = staff.reduce((s, r) => s + r.total, 0);
  const grandCount = staff.reduce((s, r) => s + r.saleCount, 0);

  return { date: dateStr, staff, grandTotal, grandCount };
}
