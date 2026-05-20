import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Package, ShoppingBag, Truck } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminListToolbar,
  AdminListToolbarClear,
  AdminListToolbarSearch,
} from "@/components/admin/admin-list-toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import {
  AdminOrdersTable,
  type AdminOrderListRow,
} from "@/components/admin/admin-orders-table";
import { ORDER_STATUSES, STATUS_LABELS } from "@/lib/admin-order-status";
import {
  AdminQuickFilterChips,
  ORDER_QUICK_FILTER_TONE,
} from "@/components/admin/admin-quick-filter-chips";
import { AdminStatCard } from "@/components/admin/users";
import { formatPrice } from "@/lib/utils";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";
import { ADMIN_LIST_PAGE_SIZE } from "@/lib/admin-list-pagination";
import { adminOrdersListWhere, mapOrderToAdminRow } from "@/lib/admin-orders-list-dto";

export default async function AdminOrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/hyr");

  const { locale } = await params;
  const acl = await getCachedEffectiveAcl(session.user.id);
  if (!acl) redirect("/hyr");
  requireAdminPageRead(locale, acl, "orders");

  const sp = await searchParams;
  const lp = locale === "sq" ? "" : `/${locale}`;
  const en = locale === "en";
  const t = (sq: string, e: string) => (en ? e : sq);
  const statusFilter = sp.status;
  const q = sp.q?.trim();
  const userIdRaw = sp.userId?.trim();
  const cuidLike = /^c[a-z0-9]{24}$/i;
  const userIdFilter = userIdRaw && cuidLike.test(userIdRaw) ? userIdRaw : undefined;

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
  let totalOrders = 0;
  let placedCount = 0;
  let confirmedCount = 0;
  let deliveredCount = 0;
  let cancelledCount = 0;
  let gmvOpen = 0;

  const listWhere = adminOrdersListWhere({ q, status: statusFilter, userId: userIdFilter });
  const filterQueryParts = new URLSearchParams();
  if (q) filterQueryParts.set("q", q);
  if (statusFilter && ORDER_STATUSES.includes(statusFilter)) filterQueryParts.set("status", statusFilter);
  if (userIdFilter) filterQueryParts.set("userId", userIdFilter);
  const filterQuery = filterQueryParts.toString();
  let filteredTotal = 0;

  try {
    const [orderRows, ft, tc, pc, cc, dc, kc, agg] = await Promise.all([
      db.order.findMany({
        where: listWhere,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { firstName: true, lastName: true } },
          company: { select: { name: true } },
        },
        take: ADMIN_LIST_PAGE_SIZE,
        skip: 0,
      }),
      db.order.count({ where: listWhere }),
      db.order.count(),
      db.order.count({ where: { status: "PLACED" } }),
      db.order.count({ where: { status: "CONFIRMED" } }),
      db.order.count({ where: { status: "DELIVERED" } }),
      db.order.count({ where: { status: "CANCELLED" } }),
      db.order.aggregate({
        where: { status: { not: "CANCELLED" } },
        _sum: { total: true },
      }),
    ]);
    orders = orderRows;
    filteredTotal = ft;
    totalOrders = tc;
    placedCount = pc;
    confirmedCount = cc;
    deliveredCount = dc;
    cancelledCount = kc;
    gmvOpen = Number(agg._sum.total ?? 0);
  } catch {
    postgresUnavailable = true;
    orders = [];
  }

  function filterHref(s: string | null) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (userIdFilter) p.set("userId", userIdFilter);
    if (s) p.set("status", s);
    return `${lp}/admin/orders?${p.toString()}`;
  }

  const baseListHref = `${lp}/admin/orders`;
  const hasActiveFilters = Boolean(
    q || (statusFilter && ORDER_STATUSES.includes(statusFilter)) || userIdFilter
  );
  const activeOrderStatus =
    statusFilter && ORDER_STATUSES.includes(statusFilter) ? statusFilter : null;

  const orderFilterChips = [
    { href: filterHref(null), label: t("Të gjitha", "All"), value: null as string | null },
    ...ORDER_STATUSES.map((s) => ({
      href: filterHref(s),
      label: STATUS_LABELS[s]?.[locale as "sq" | "en"] ?? s,
      value: s,
      inactiveClassName: ORDER_QUICK_FILTER_TONE[s],
    })),
  ];

  const initialOrders = orders.map(mapOrderToAdminRow);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("Porositë", "Orders")}
        description={t(
          `${filteredTotal} porosi në këtë pamje`,
          `${filteredTotal} orders in this view`
        )}
        toolbar={
          <AdminListToolbar>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
              <AdminListToolbarSearch
                action={`${lp}/admin/orders`}
                placeholder={t("Kërko sipas numrit të porosisë…", "Search by order number…")}
                defaultQuery={q}
                hiddenFields={{
                  ...(statusFilter && ORDER_STATUSES.includes(statusFilter) ? { status: statusFilter } : {}),
                  ...(userIdFilter ? { userId: userIdFilter } : {}),
                }}
                submitLabelSq="Kërko"
                submitLabelEn="Search"
                locale={locale}
              />
              <AdminListToolbarClear
                href={baseListHref}
                labelSq="Pastro filtrat"
                labelEn="Clear filters"
                locale={locale}
                visible={hasActiveFilters}
              />
            </div>
            <AdminQuickFilterChips
              title={t("Statusi i porosisë", "Order status")}
              chips={orderFilterChips}
              activeValue={activeOrderStatus}
              ariaLabel={t("Filtro sipas statusit të porosisë", "Filter orders by status")}
            />
          </AdminListToolbar>
        }
      />

      {!postgresUnavailable ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <AdminStatCard label={t("Gjithsej", "Total")} value={totalOrders} icon={ShoppingBag} />
          <AdminStatCard label={t("Të vendosura", "Placed")} value={placedCount} icon={Package} />
          <AdminStatCard label={t("Të konfirmuara", "Confirmed")} value={confirmedCount} icon={Truck} />
          <AdminStatCard label={t("Të dorëzuara", "Delivered")} value={deliveredCount} icon={Truck} />
          <AdminStatCard label={t("Të anuluara", "Cancelled")} value={cancelledCount} icon={ShoppingBag} />
          <AdminStatCard
            label={t("Vlera (jo anuluar)", "Value (non-cancelled)")}
            value={formatPrice(gmvOpen)}
            icon={ShoppingBag}
          />
        </div>
      ) : null}

      {postgresUnavailable ? (
        <EmptyState
          icon={ShoppingBag}
          className="rounded-2xl border border-border/50 bg-card/40 py-16"
          title={locale === "sq" ? "Postgres nuk është i lidhur" : "PostgreSQL unavailable"}
          description={
            locale === "sq"
              ? "Nuk mund të lexohen porositë. Nis Postgres: docker compose up -d postgres. Në .env vendos DATABASE_URL=postgresql://itarena:itarena@localhost:5432/itarena (sipas docker-compose), pastaj npx prisma migrate deploy."
              : "Cannot load orders. Start Postgres (docker compose up -d postgres), set DATABASE_URL to match docker-compose (e.g. postgresql://itarena:itarena@localhost:5432/itarena), then npx prisma migrate deploy."
          }
        />
      ) : filteredTotal === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          className="rounded-2xl border border-border/50 bg-card/40 py-16"
          title={
            hasActiveFilters
              ? t("Nuk u gjetën porosi", "No orders match")
              : t("Nuk ka porosi ende", "No orders yet")
          }
          description={
            hasActiveFilters
              ? t("Provo të ndryshosh kërkimin ose filtrat.", "Try adjusting search or filters.")
              : t("Porositë do të shfaqen këtu.", "Orders will appear here.")
          }
          action={hasActiveFilters ? { label: t("Pastro filtrat", "Clear filters"), href: baseListHref } : undefined}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.06]">
          <AdminOrdersTable
            initialOrders={initialOrders}
            totalCount={filteredTotal}
            pageSize={ADMIN_LIST_PAGE_SIZE}
            locale={locale}
            lp={lp}
            filterQuery={filterQuery}
          />
        </div>
      )}
    </div>
  );
}
