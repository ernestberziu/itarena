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
import { adminListShellClassName } from "@/lib/admin-list-ui";
import { adminOrdersListWhere, mapOrderToAdminRow } from "@/lib/admin-orders-list-dto";
import { dbUnavailableDescription } from "@/lib/db-unavailable-message";
import { getAdminUiT } from "@/lib/i18n/ui-t-server";

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
  const tUi = await getAdminUiT(locale);
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
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[admin/orders] database error:", err);
    }
    postgresUnavailable = true;
    orders = [];
  }

  const dbMsg = dbUnavailableDescription(locale, "orders");

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
    { href: filterHref(null), label: tUi("all"), value: null as string | null },
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
        title={tUi("orders")}
        description={tUi("orders_page_desc", { count: filteredTotal })}
        toolbar={
          <AdminListToolbar>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
              <AdminListToolbarSearch
                action={`${lp}/admin/orders`}
                placeholder={tUi("search_by_order_number")}
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
              title={tUi("order_status")}
              chips={orderFilterChips}
              activeValue={activeOrderStatus}
              ariaLabel={tUi("filter_orders_by_status")}
            />
          </AdminListToolbar>
        }
      />

      {!postgresUnavailable ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <AdminStatCard label={tUi("total_2")} value={totalOrders} icon={ShoppingBag} />
          <AdminStatCard label={tUi("placed")} value={placedCount} icon={Package} />
          <AdminStatCard label={tUi("confirmed")} value={confirmedCount} icon={Truck} />
          <AdminStatCard label={tUi("delivered")} value={deliveredCount} icon={Truck} />
          <AdminStatCard label={tUi("cancelled")} value={cancelledCount} icon={ShoppingBag} />
          <AdminStatCard
            label={tUi("value_non_cancelled")}
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
          description={locale === "sq" ? dbMsg.sq : dbMsg.en}
        />
      ) : filteredTotal === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          className="rounded-2xl border border-border/50 bg-card/40 py-16"
          title={
            hasActiveFilters
              ? tUi("no_orders_match")
              : tUi("no_orders_yet")
          }
          description={
            hasActiveFilters
              ? tUi("try_adjusting_search_or_filters")
              : tUi("orders_will_appear_here")
          }
          action={hasActiveFilters ? { label: tUi("clear_filters_2"), href: baseListHref } : undefined}
        />
      ) : (
        <div className={adminListShellClassName}>
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
