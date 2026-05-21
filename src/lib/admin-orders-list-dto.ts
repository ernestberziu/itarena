import { ORDER_STATUSES } from "@/lib/admin-order-status";
import type { AdminOrderListRow } from "@/components/admin/admin-orders-table";

type OrderDbRow = {
  id: string;
  orderNumber: string;
  status: string;
  channel: string;
  total: unknown;
  items: unknown;
  createdAt: Date;
  user: { firstName: string; lastName: string };
  company: { name: string } | null;
};

export function adminOrdersListWhere(input: {
  q?: string | null;
  status?: string | null;
  userId?: string | null;
}) {
  const statusFilter = input.status?.trim();
  const q = input.q?.trim();
  const userIdRaw = input.userId?.trim();
  const cuidLike = /^c[a-z0-9]{24}$/i;
  const userIdFilter = userIdRaw && cuidLike.test(userIdRaw) ? userIdRaw : undefined;

  return {
    ...(userIdFilter ? { userId: userIdFilter } : {}),
    ...(statusFilter && ORDER_STATUSES.includes(statusFilter) ? { status: statusFilter } : {}),
    ...(q ? { OR: [{ orderNumber: { contains: q } }] } : {}),
  };
}

export function mapOrderToAdminRow(order: OrderDbRow): AdminOrderListRow {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    channel: order.channel,
    total: String(order.total),
    itemsJson: order.items as string,
    createdAt: order.createdAt.toISOString(),
    user: order.user,
    company: order.company,
  };
}
