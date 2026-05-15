import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { FilterBar } from "@/components/admin/filter-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  AdminOrdersTable,
  type AdminOrderListRow,
} from "@/components/admin/admin-orders-table";
import { ORDER_STATUSES, STATUS_LABELS } from "@/lib/admin-order-status";

export default async function AdminOrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await auth();
  if (!session) redirect("/hyr");

  const { locale } = await params;
  const sp = await searchParams;
  const lp = locale === "sq" ? "" : `/${locale}`;
  const statusFilter = sp.status;
  const q = sp.q?.trim();

  let orders: Awaited<
    ReturnType<
      typeof db.order.findMany<{
        include: {
          user: { select: { firstName: true; lastName: true } };
          company: { select: { name: true } };
        };
      }>
    >
  >;
  let postgresUnavailable = false;

  try {
    orders = await db.order.findMany({
      where: {
        ...(statusFilter && ORDER_STATUSES.includes(statusFilter) ? { status: statusFilter } : {}),
        ...(q ? { OR: [{ orderNumber: { contains: q } }] } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { firstName: true, lastName: true } },
        company: { select: { name: true } },
      },
    });
  } catch {
    postgresUnavailable = true;
    orders = [];
  }

  function filterHref(s: string | null) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (s) p.set("status", s);
    return `${lp}/admin/orders?${p.toString()}`;
  }

  const rows: AdminOrderListRow[] = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    total: String(order.total),
    itemsJson: order.items as string,
    createdAt: order.createdAt.toISOString(),
    user: order.user,
    company: order.company,
  }));

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title={locale === "sq" ? "Porositë" : "Orders"}
        description={`${orders.length} ${locale === "sq" ? "porosi" : "orders"}`}
        toolbar={
          <FilterBar>
            <form method="GET" action={`${lp}/admin/orders`}>
              <input
                name="q"
                defaultValue={q}
                placeholder={locale === "sq" ? "Kërko porosi..." : "Search orders..."}
                className="h-8 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-52"
              />
              {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
            </form>
            <div className="flex flex-wrap gap-1">
              {[null, ...ORDER_STATUSES].map((s) => {
                const label = s
                  ? (STATUS_LABELS[s]?.[locale as "sq" | "en"] ?? s)
                  : locale === "sq"
                    ? "Të gjitha"
                    : "All";
                return (
                  <Link key={s ?? "all"} href={filterHref(s)}>
                    <Badge
                      variant={statusFilter === s || (!statusFilter && !s) ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                    >
                      {label}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </FilterBar>
        }
      />

      {postgresUnavailable ? (
        <EmptyState
          icon={ShoppingBag}
          title={locale === "sq" ? "Postgres nuk është i lidhur" : "PostgreSQL unavailable"}
          description={
            locale === "sq"
              ? "Nuk mund të lexohen porositë. Nis Postgres: docker compose up -d postgres. Në .env vendos DATABASE_URL=postgresql://itarena:itarena@localhost:5432/itarena (sipas docker-compose), pastaj npx prisma migrate deploy."
              : "Cannot load orders. Start Postgres (docker compose up -d postgres), set DATABASE_URL to match docker-compose (e.g. postgresql://itarena:itarena@localhost:5432/itarena), then npx prisma migrate deploy."
          }
        />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={locale === "sq" ? "Nuk u gjetën porosi" : "No orders found"}
          description={locale === "sq" ? "Nuk ka porosi ende" : "No orders yet"}
        />
      ) : (
        <AdminOrdersTable orders={rows} locale={locale} />
      )}
    </div>
  );
}
