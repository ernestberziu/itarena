"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminQuoteStatusUpdater } from "@/components/admin/quote-status-updater";
import { formatDate, formatPrice } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/admin-quote-status";

export { QUOTE_STATUSES, STATUS_LABELS } from "@/lib/admin-quote-status";

export type AdminQuoteRow = {
  id: string;
  quoteNumber: string;
  title: string;
  status: string;
  /** Serialized decimal / number */
  total: string | null;
  createdAt: string;
  requestedBy: { firstName: string; lastName: string };
  company: { name: string } | null;
};

export function AdminQuotesTable({ quotes, locale }: { quotes: AdminQuoteRow[]; locale: string }) {
  const columns = useMemo<ColumnDef<AdminQuoteRow>[]>(() => {
    const th = (sq: string, en: string) => (locale === "sq" ? sq : en);
    return [
      { accessorKey: "quoteNumber", header: th("Nr. Ofertës", "Quote #"), cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.original.quoteNumber}</span>
      ) },
      { accessorKey: "title", header: th("Titulli", "Title"), cell: ({ row }) => (
        <span className="font-medium max-w-xs truncate block">{row.original.title}</span>
      ) },
      {
        id: "requester",
        header: th("Klienti", "Requester"),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.requestedBy.firstName} {row.original.requestedBy.lastName}
          </span>
        ),
      },
      {
        id: "company",
        header: th("Kompania", "Company"),
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.company?.name ?? "—"}</span>,
      },
      {
        id: "total",
        header: th("Shuma", "Amount"),
        cell: ({ row }) => {
          const n = row.original.total == null ? null : Number(row.original.total);
          return (
            <span className="font-semibold tabular-nums">
              {n != null && !Number.isNaN(n) ? formatPrice(n) : "—"}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: th("Statusi", "Status"),
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
        header: th("Krijuar", "Created"),
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(new Date(row.original.createdAt))}</span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <AdminQuoteStatusUpdater quoteId={row.original.id} currentStatus={row.original.status} locale={locale} />
        ),
      },
    ];
  }, [locale]);

  return <AdminDataTable columns={columns} data={quotes} pageSize={50} />;
}
