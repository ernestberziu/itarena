import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import {
  normalizeOrderItems,
  orderFulfillmentSummary,
  parseFulfillmentItems,
  type OrderLineItem,
} from "@/lib/order-fulfillment";
import { buildOrderAuditChanges } from "@/lib/order-activity";

const orderItemSchema = z.object({
  sku: z.string().optional(),
  name: z.string(),
  nameEn: z.string().optional(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  fulfilledQty: z.number().int().min(0).optional(),
});

const patchSchema = z
  .object({
    status: z.enum(["PLACED", "CONFIRMED", "DISPATCHED", "DELIVERED", "CANCELLED"]).optional(),
    staffNotes: z.string().optional(),
    notes: z.string().optional(),
    items: z.array(orderItemSchema).min(1).optional(),
  })
  .refine(
    (data) =>
      data.status !== undefined || data.staffNotes !== undefined || data.items !== undefined,
    { message: "Nothing to update" }
  );

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);

  const isStaff = ["ADMIN", "OPS"].includes(session.user.role);
  if (!isStaff) return apiErr(req, "forbidden", 403);

  const denied = await assertAdminApiAcl(session.user.id, "orders", "write");
  if (denied) return denied;

  const { id } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const order = await db.order.findUnique({ where: { id } });
  if (!order) return apiErr(req, "notFound", 404);

  const updateData: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) {
    updateData.status = parsed.data.status;
    if (parsed.data.status === "CONFIRMED" && !order.confirmedAt) {
      updateData.confirmedAt = new Date();
    }
    if (parsed.data.status === "DISPATCHED" && !order.dispatchedAt) {
      updateData.dispatchedAt = new Date();
    }
    if (parsed.data.status === "DELIVERED" && !order.deliveredAt) {
      updateData.deliveredAt = new Date();
    }
    if (parsed.data.status === "CANCELLED" && !order.cancelledAt) {
      updateData.cancelledAt = new Date();
    }
  }
  if (parsed.data.staffNotes !== undefined) updateData.staffNotes = parsed.data.staffNotes;
  if (parsed.data.notes !== undefined) updateData.deliveryNotes = parsed.data.notes;

  let fulfillmentAudit: ReturnType<typeof orderFulfillmentSummary> | null = null;
  let mergedItems: OrderLineItem[] | undefined;

  if (parsed.data.items !== undefined) {
    const existing = parseFulfillmentItems(order.items);
    if (existing.length !== parsed.data.items.length) {
      return NextResponse.json({ error: "Invalid items" }, { status: 400 });
    }

    const merged: OrderLineItem[] = existing.map((row, index) => {
      const next = parsed.data.items![index];
      const fulfilledQty = Math.min(Math.max(0, next.fulfilledQty ?? next.quantity), row.quantity);
      return normalizeOrderItems([
        {
          ...row,
          sku: row.sku ?? next.sku,
          name: row.name,
          nameEn: row.nameEn ?? next.nameEn,
          quantity: row.quantity,
          price: row.price,
          fulfilledQty,
        },
      ])[0];
    });

    const summary = orderFulfillmentSummary(merged);
    fulfillmentAudit = summary;
    mergedItems = merged;
    updateData.items = JSON.stringify(merged);
    updateData.subtotal = summary.fulfilledTotal;
    updateData.total = summary.fulfilledTotal;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  await db.order.update({ where: { id }, data: updateData });

  const auditChanges = buildOrderAuditChanges(
    order,
    {
      status: parsed.data.status,
      staffNotes: parsed.data.staffNotes,
      items: mergedItems,
    },
    mergedItems,
    fulfillmentAudit?.fulfilledTotal
  );

  if (auditChanges.length > 0) {
    await db.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "UPDATE",
        resource: "Order",
        resourceId: id,
        metadata: JSON.stringify({ changes: auditChanges }),
      },
    });
  }

  if (parsed.data.status && parsed.data.status !== order.status) {
    const { emitNotificationSafe } = await import("@/lib/notifications");
    emitNotificationSafe({
      type: "ORDER_STATUS_CHANGED",
      actorId: session.user.id,
      entity: { type: "order", id },
      dedupeKey: `order:${id}:status:${parsed.data.status}`,
      payload: {
        orderId: id,
        orderNumber: order.orderNumber,
        status: parsed.data.status,
        oldStatus: order.status,
      },
    });
  }

  return NextResponse.json({ success: true });
}
