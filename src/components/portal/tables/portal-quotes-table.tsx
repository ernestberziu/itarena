"use client";
import { useUiT } from "@/hooks/use-ui-t";

import { useMemo, useRef, useState } from "react";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { motion, useReducedMotion } from "framer-motion";
import { AdminInfiniteTable } from "@/components/admin/admin-infinite-table";
import { QuoteStatusBadge } from "@/components/admin/quote-status-badge";
import { formatDate, formatPrice } from "@/lib/utils";
import { PortalQuoteActions } from "@/components/portal/tables/portal-quote-actions";

export type PortalQuoteRow = {
  id: string;
  quoteNumber: string;
  title: string;
  status: string;
  amount: number | null;
  validUntil: string | null;
  createdAt: string;
  pdfUrl: string | null;
  requestedBy: { firstName: string; lastName: string };
};

export function PortalQuotesTable({
  rows,
  locale,
  companyScope,
  labels,
}: {
  rows: PortalQuoteRow[];
  locale: string;
  companyScope: boolean;
  labels: { accept: string; reject: string; download_pdf: string };
}) {
  const thUi = useUiT();
  const reduceMotion = useReducedMotion();
  const [sorting, setSorting] = useState<SortingState>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const totalCount = rows.length;
  const emptyMessage = thUi("no_quotes_found");

  const columns = useMemo<ColumnDef<PortalQuoteRow>[]>(() => {
    const cols: ColumnDef<PortalQuoteRow>[] = [
      {
        accessorKey: "quoteNumber",
        header: thUi("text"),
        enableSorting: true,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-medium text-foreground">{row.original.quoteNumber}</span>
        ),
      },
      {
        accessorKey: "title",
        header: thUi("request"),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="min-w-0 max-w-xs">
            <p className="truncate font-medium">{row.original.title}</p>
            {companyScope ? (
              <p className="truncate text-xs text-muted-foreground">
                {row.original.requestedBy.firstName} {row.original.requestedBy.lastName}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        id: "amount",
        accessorFn: (row) => row.amount ?? 0,
        header: thUi("amount"),
        enableSorting: true,
        cell: ({ row }) => (
          <span className="font-semibold tabular-nums">
            {row.original.amount != null ? formatPrice(row.original.amount) : "—"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: thUi("status"),
        enableSorting: true,
        cell: ({ row }) => (
          <QuoteStatusBadge
            status={row.original.status}
            locale={locale}
            validUntil={row.original.validUntil}
          />
        ),
      },
      {
        accessorKey: "createdAt",
        header: thUi("created"),
        enableSorting: true,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {formatDate(new Date(row.original.createdAt))}
          </span>
        ),
      },
      {
        id: "validUntil",
        accessorKey: "validUntil",
        header: thUi("expires"),
        enableSorting: true,
        cell: ({ row }) =>
          row.original.validUntil ? (
            <span className="whitespace-nowrap text-xs text-muted-foreground">
              {formatDate(new Date(row.original.validUntil))}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <PortalQuoteActions
            quoteId={row.original.id}
            status={row.original.status}
            pdfUrl={row.original.pdfUrl}
            locale={locale}
            labels={labels}
          />
        ),
      },
    ];
    return cols;
  }, [companyScope, labels, locale]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      <div className="hidden lg:block">
        <AdminInfiniteTable
          table={table}
          locale={locale}
          labels={{
            entitySq: "oferta",
            entityEn: "quotes",
            emptySq: emptyMessage,
            emptyEn: emptyMessage,
          }}
          totalCount={totalCount}
          loadedCount={totalCount}
          hasMore={false}
          loadingMore={false}
          error={null}
          scrollRef={scrollRef}
          sentinelRef={sentinelRef}
          getRowId={(r) => r.id}
          minTableWidth="880px"
        />
      </div>

      <div className="space-y-3 border-t border-border/60 px-4 py-3 lg:hidden">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium tabular-nums text-foreground">{totalCount}</span>
          <span className="ml-1">{thUi("quotes")}</span>
        </p>
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-16 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          rows.map((q, i) => (
            <motion.article
              key={q.id}
              layout
              {...(!reduceMotion ? { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 } } : {})}
              transition={{ duration: reduceMotion ? 0 : 0.2, delay: reduceMotion ? 0 : i * 0.03 }}
              className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-mono text-xs font-medium text-foreground">{q.quoteNumber}</span>
                  <h3 className="mt-1 line-clamp-2 font-semibold leading-snug">{q.title}</h3>
                  {companyScope ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {q.requestedBy.firstName} {q.requestedBy.lastName}
                    </p>
                  ) : null}
                </div>
                <PortalQuoteActions
                  quoteId={q.id}
                  status={q.status}
                  pdfUrl={q.pdfUrl}
                  locale={locale}
                  labels={labels}
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <QuoteStatusBadge status={q.status} locale={locale} validUntil={q.validUntil} />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>
                  {thUi("amount")}:{" "}
                  <span className="font-semibold text-foreground">
                    {q.amount != null ? formatPrice(q.amount) : "—"}
                  </span>
                </span>
                <span>
                  {thUi("created")}: {formatDate(new Date(q.createdAt))}
                </span>
                {q.validUntil ? (
                  <span>
                    {thUi("expires")}: {formatDate(new Date(q.validUntil))}
                  </span>
                ) : null}
              </div>
            </motion.article>
          ))
        )}
      </div>
    </>
  );
}
