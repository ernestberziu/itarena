"use client";
import { useUiT } from "@/hooks/use-ui-t";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { AdminInfiniteTable } from "@/components/admin/admin-infinite-table";
import { AdminOrderRowActions } from "@/components/admin/admin-order-row-actions";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice } from "@/lib/utils";
import { useInfiniteList } from "@/hooks/use-infinite-list";
import { useMobileInfiniteSentinel } from "@/hooks/use-mobile-infinite-sentinel";

export { ORDER_STATUSES, STATUS_LABELS } from "@/lib/admin-order-status";

export type AdminOrderListRow = {
  id: string;
  orderNumber: string;
  status: string;
  channel: string;
  total: number | string;
  itemsJson: string;
  createdAt: string;
  user: { firstName: string; lastName: string };
  company: { name: string } | null;
};

function itemCount(itemsJson: string): number {
  try {
    const parsed = JSON.parse(itemsJson);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

export function AdminOrdersTable({
  initialOrders,
  totalCount,
  pageSize,
  locale,
  lp,
  filterQuery,
}: {
  initialOrders: AdminOrderListRow[];
  totalCount: number;
  pageSize: number;
  locale: string;
  lp: string;
  filterQuery: string;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const thUi = useUiT();
  const [sorting, setSorting] = useState<SortingState>([]);

  const { rows, hasMore, loadingMore, error, scrollRef, sentinelRef, loadedCount, loadNext } =
    useInfiniteList({
      initialItems: initialOrders,
      totalCount,
      pageSize,
      filterQuery,
      fetchUrl: "/api/admin/orders",
      getRowId: (r) => r.id,
      locale,
    });

  const mobileSentinelRef = useMobileInfiniteSentinel(loadNext);

  const openOrder = useCallback(
    (row: AdminOrderListRow) => {
      router.push(`${lp}/admin/orders/${row.id}`);
    },
    [lp, router]
  );

  const columns = useMemo<ColumnDef<AdminOrderListRow>[]>(() => {
    return [
      {
        accessorKey: "orderNumber",
        header: thUi("order"),
        enableSorting: true,
        cell: ({ row }) => {
          const href = `${lp}/admin/orders/${row.original.id}`;
          const isPos = row.original.channel === "POS";
          return (
            <div className="flex flex-wrap items-center gap-1.5">
              <Link
                href={href}
                className="font-mono text-xs font-medium text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {row.original.orderNumber}
              </Link>
              {isPos ? (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-semibold">
                  POS
                </Badge>
              ) : null}
            </div>
          );
        },
      },
      {
        id: "customer",
        accessorFn: (row) => `${row.user.firstName} ${row.user.lastName}`.toLowerCase(),
        header: thUi("customer"),
        enableSorting: true,
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.user.firstName} {row.original.user.lastName}
          </span>
        ),
      },
      {
        id: "company",
        accessorFn: (row) => row.company?.name?.toLowerCase() ?? "",
        header: thUi("company"),
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.company?.name ?? "—"}</span>
        ),
      },
      {
        id: "items",
        accessorFn: (row) => itemCount(row.itemsJson),
        header: thUi("items"),
        enableSorting: true,
        cell: ({ row }) => (
          <span className="tabular-nums text-sm">{itemCount(row.original.itemsJson)}</span>
        ),
      },
      {
        id: "total",
        accessorFn: (row) => Number(row.total) || 0,
        header: thUi("total"),
        enableSorting: true,
        cell: ({ row }) => (
          <span className="font-semibold tabular-nums">{formatPrice(Number(row.original.total))}</span>
        ),
      },
      {
        accessorKey: "status",
        header: thUi("status"),
        enableSorting: true,
        cell: ({ row }) => (
          <OrderStatusBadge status={row.original.status} locale={locale} />
        ),
      },
      {
        accessorKey: "createdAt",
        header: thUi("date"),
        enableSorting: true,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {formatDate(new Date(row.original.createdAt))}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <AdminOrderRowActions
            orderId={row.original.id}
            detailHref={`${lp}/admin/orders/${row.original.id}`}
            currentStatus={row.original.status}
            locale={locale}
          />
        ),
      },
    ];
  }, [locale, lp]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const emptyMessage = thUi("no_orders_found");

  return (
    <>
      <div className="hidden lg:block">
        <AdminInfiniteTable
          table={table}
          locale={locale}
          labels={{
            entitySq: "porosi",
            entityEn: "orders",
            emptySq: emptyMessage,
            emptyEn: emptyMessage,
          }}
          totalCount={totalCount}
          loadedCount={loadedCount}
          hasMore={hasMore}
          loadingMore={loadingMore}
          error={error}
          scrollRef={scrollRef}
          sentinelRef={sentinelRef}
          onRowClick={openOrder}
          getRowId={(r) => r.id}
          minTableWidth="920px"
        />
      </div>

      <div className="space-y-3 border-t border-border/60 py-3 lg:hidden">
        <p className="text-xs text-muted-foreground px-1">
          <span className="font-medium tabular-nums text-foreground">{loadedCount}</span>
          <span className="text-muted-foreground/70"> / </span>
          <span className="tabular-nums">{totalCount}</span>
        </p>
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-16 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          rows.map((order, i) => (
            <motion.article
              key={order.id}
              layout
              role="button"
              tabIndex={0}
              onClick={() => openOrder(order)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openOrder(order);
                }
              }}
              {...(!reduceMotion
                ? { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 } }
                : {})}
              transition={{ duration: reduceMotion ? 0 : 0.2, delay: reduceMotion ? 0 : i * 0.03 }}
              className="cursor-pointer rounded-2xl border border-border/60 bg-card p-4 shadow-sm ring-1 ring-black/[0.03] transition-colors hover:bg-muted/20 dark:ring-white/[0.05]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-primary">
                      {order.orderNumber}
                    </span>
                    {order.channel === "POS" ? (
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                        POS
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 font-medium">
                    {order.user.firstName} {order.user.lastName}
                  </p>
                  {order.company?.name ? (
                    <p className="text-sm text-muted-foreground truncate">{order.company.name}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDate(new Date(order.createdAt))} · {itemCount(order.itemsJson)}{" "}
                    {thUi("items_2")}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="font-semibold tabular-nums">{formatPrice(Number(order.total))}</span>
                  <OrderStatusBadge status={order.status} locale={locale} />
                  <div onClick={(e) => e.stopPropagation()}>
                    <AdminOrderRowActions
                      orderId={order.id}
                      detailHref={`${lp}/admin/orders/${order.id}`}
                      currentStatus={order.status}
                      locale={locale}
                    />
                  </div>
                </div>
              </div>
            </motion.article>
          ))
        )}
        {loadingMore ? (
          <p className="py-2 text-center text-xs text-muted-foreground">{thUi("loading")}</p>
        ) : null}
        {error ? <p className="text-center text-xs text-destructive">{error}</p> : null}
        <div ref={mobileSentinelRef} className="h-px w-full" aria-hidden />
      </div>
    </>
  );
}
