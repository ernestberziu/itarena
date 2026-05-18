"use client";

import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { AdminInfiniteTable } from "@/components/admin/admin-infinite-table";
import { AdminOrderStatusUpdater } from "@/components/admin/order-status-updater";
import { formatDate, formatPrice } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/admin-order-status";
import { useInfiniteList } from "@/hooks/use-infinite-list";

export { ORDER_STATUSES, STATUS_LABELS } from "@/lib/admin-order-status";

export type AdminOrderListRow = {
  id: string;
  orderNumber: string;
  status: string;
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
  filterQuery,
}: {
  initialOrders: AdminOrderListRow[];
  totalCount: number;
  pageSize: number;
  locale: string;
  filterQuery: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const { rows, hasMore, loadingMore, error, scrollRef, sentinelRef, loadedCount } =
    useInfiniteList({
      initialItems: initialOrders,
      totalCount,
      pageSize,
      filterQuery,
      fetchUrl: "/api/admin/orders",
      getRowId: (r) => r.id,
      locale,
    });

  const columns = useMemo<ColumnDef<AdminOrderListRow>[]>(() => {
    const th = (sq: string, en: string) => (locale === "sq" ? sq : en);
    return [
      {
        accessorKey: "orderNumber",
        header: th("Nr. Porosisë", "Order #"),
        enableSorting: true,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.orderNumber}</span>
        ),
      },
      {
        id: "customer",
        accessorFn: (row) => `${row.user.firstName} ${row.user.lastName}`.toLowerCase(),
        header: th("Klienti", "Customer"),
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
        header: th("Kompania", "Company"),
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.company?.name ?? "—"}</span>
        ),
      },
      {
        id: "items",
        accessorFn: (row) => itemCount(row.itemsJson),
        header: th("Artikuj", "Items"),
        enableSorting: true,
        cell: ({ row }) => (
          <span className="tabular-nums text-sm">{itemCount(row.original.itemsJson)}</span>
        ),
      },
      {
        id: "total",
        accessorFn: (row) => Number(row.total) || 0,
        header: th("Total", "Total"),
        enableSorting: true,
        cell: ({ row }) => (
          <span className="font-semibold tabular-nums">{formatPrice(Number(row.original.total))}</span>
        ),
      },
      {
        accessorKey: "status",
        header: th("Statusi", "Status"),
        enableSorting: true,
        cell: ({ row }) => {
          const sl = STATUS_LABELS[row.original.status];
          return sl ? (
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${sl.color}`}
            >
              {sl[locale as "sq" | "en"]}
            </span>
          ) : null;
        },
      },
      {
        accessorKey: "createdAt",
        header: th("Datë", "Date"),
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
          <div onClick={(e) => e.stopPropagation()}>
            <AdminOrderStatusUpdater
              orderId={row.original.id}
              currentStatus={row.original.status}
              locale={locale}
            />
          </div>
        ),
      },
    ];
  }, [locale]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <AdminInfiniteTable
      table={table}
      locale={locale}
      labels={{
        entitySq: "porosi",
        entityEn: "orders",
        emptySq: "Nuk u gjetën porosi",
        emptyEn: "No orders found",
      }}
      totalCount={totalCount}
      loadedCount={loadedCount}
      hasMore={hasMore}
      loadingMore={loadingMore}
      error={error}
      scrollRef={scrollRef}
      sentinelRef={sentinelRef}
      minTableWidth="920px"
    />
  );
}
