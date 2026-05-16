"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminOrderStatusUpdater } from "@/components/admin/order-status-updater";
import { formatDate, formatPrice } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/admin-order-status";

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

export function AdminOrdersTable({ orders, locale }: { orders: AdminOrderListRow[]; locale: string }) {
  const columns = useMemo<ColumnDef<AdminOrderListRow>[]>(() => {
    const th = (sq: string, en: string) => (locale === "sq" ? sq : en);
    return [
      {
        accessorKey: "orderNumber",
        header: th("Nr. Porosisë", "Order #"),
        enableSorting: true,
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.orderNumber}</span>,
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
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.company?.name ?? "—"}</span>,
      },
      {
        id: "items",
        accessorFn: (row) => itemCount(row.itemsJson),
        header: th("Artikuj", "Items"),
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm text-center tabular-nums">{itemCount(row.original.itemsJson)}</span>
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
            <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${sl.color}`}>
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
          <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(new Date(row.original.createdAt))}</span>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <AdminOrderStatusUpdater orderId={row.original.id} currentStatus={row.original.status} locale={locale} />
        ),
      },
    ];
  }, [locale]);

  return <AdminDataTable columns={columns} data={orders} pageSize={50} variant="adminSaaS" stickyHeader paginationLocale={locale === "en" ? "en" : "sq"} />;
}
