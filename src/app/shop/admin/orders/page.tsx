import { db } from "@/lib/db";
import { AdminOrderList } from "@/components/shop/admin-order-list";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export const metadata = { title: "Admin — Porositë" };

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const serialized = orders.map((o) => ({
    ...o,
    subtotal: Number(o.subtotal),
    total: Number(o.total),
    items: (() => {
      try {
        return JSON.parse(o.items);
      } catch {
        return [];
      }
    })(),
  }));

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Menaxho Porositë" description={`${orders.length} porosi gjithsej`} />
      <AdminOrderList orders={serialized} />
    </div>
  );
}
