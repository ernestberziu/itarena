"use client";
import { useUiT } from "@/hooks/use-ui-t";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { motion, useReducedMotion } from "framer-motion";
import { AdminInfiniteTable } from "@/components/admin/admin-infinite-table";
import { useInfiniteList } from "@/hooks/use-infinite-list";
import { AdminQuoteRowActions } from "@/components/admin/admin-quote-row-actions";
import { QuoteStatusBadge } from "@/components/admin/quote-status-badge";
import { formatDate, formatPrice } from "@/lib/utils";
import { summarizeServicesJson } from "@/lib/quote-display";

export { QUOTE_STATUSES, STATUS_LABELS } from "@/lib/admin-quote-status";

export type AdminQuoteRow = {
  id: string;
  quoteNumber: string;
  title: string;
  status: string;
  total: string | null;
  createdAt: string;
  validUntil: string | null;
  services: string;
  contactName: string;
  contactEmail: string;
  pdfUrl: string | null;
  requestedBy: { firstName: string; lastName: string };
  company: { name: string } | null;
};

export function AdminQuotesTable({
  initialQuotes,
  totalCount,
  pageSize,
  locale,
  lp,
  filterQuery,
}: {
  initialQuotes: AdminQuoteRow[];
  totalCount: number;
  pageSize: number;
  locale: string;
  lp: string;
  filterQuery: string;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const thUi = useUiT();
  const emptyMessage = thUi("no_results_for_this_search");
  const [sorting, setSorting] = useState<SortingState>([]);
  const mobileSentinelRef = useRef<HTMLDivElement>(null);

  const { rows, hasMore, loadingMore, error, scrollRef, sentinelRef, loadedCount, loadNext } =
    useInfiniteList({
      initialItems: initialQuotes,
      totalCount,
      pageSize,
      filterQuery,
      fetchUrl: "/api/admin/quotes",
      getRowId: (r) => r.id,
      locale,
    });

  useEffect(() => {
    const target = mobileSentinelRef.current;
    if (!target) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadNext();
      },
      { rootMargin: "120px", threshold: 0 }
    );
    obs.observe(target);
    return () => obs.disconnect();
  }, [loadNext]);

  const columns = useMemo<ColumnDef<AdminQuoteRow>[]>(() => {
    return [
      {
        accessorKey: "quoteNumber",
        header: thUi("text"),
        enableSorting: true,
        cell: ({ row }) => {
          const href = `${lp}/admin/quotes/${row.original.id}`;
          return (
            <Link
              href={href}
              className="font-mono text-xs font-medium text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {row.original.quoteNumber}
            </Link>
          );
        },
      },
      {
        accessorKey: "title",
        header: thUi("request"),
        enableSorting: true,
        sortingFn: "alphanumeric",
        cell: ({ row }) => {
          const summary = summarizeServicesJson(row.original.services, locale as "sq" | "en");
          return (
            <div className="max-w-[min(100vw,20rem)] lg:max-w-xs">
              <p className="truncate font-medium">{row.original.title}</p>
              {summary ? (
                <p className="truncate text-xs text-muted-foreground" title={summary}>
                  {summary}
                </p>
              ) : null}
            </div>
          );
        },
      },
      {
        id: "customer",
        accessorFn: (row) => `${row.contactName} ${row.contactEmail}`.toLowerCase(),
        header: thUi("customer"),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{row.original.contactName}</p>
            <p className="truncate text-xs text-muted-foreground">{row.original.contactEmail}</p>
          </div>
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
        id: "total",
        accessorFn: (row) => {
          const n = row.total == null ? NaN : Number(row.total);
          return Number.isNaN(n) ? 0 : n;
        },
        header: thUi("amount"),
        enableSorting: true,
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
        header: thUi("status"),
        enableSorting: true,
        sortingFn: "alphanumeric",
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
          <AdminQuoteRowActions
            quoteId={row.original.id}
            detailHref={`${lp}/admin/quotes/${row.original.id}`}
            currentStatus={row.original.status}
            locale={locale}
            pdfUrl={row.original.pdfUrl}
          />
        ),
      },
    ];
  }, [locale, lp, thUi]);

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
          loadedCount={loadedCount}
          hasMore={hasMore}
          loadingMore={loadingMore}
          error={error}
          scrollRef={scrollRef}
          sentinelRef={sentinelRef}
          onRowClick={(row) => router.push(`${lp}/admin/quotes/${row.id}`)}
          getRowId={(r) => r.id}
          minTableWidth="920px"
        />
      </div>

      <div className="space-y-3 lg:hidden border-t border-border/60 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium tabular-nums text-foreground">{loadedCount}</span>
          <span className="text-muted-foreground/70"> / </span>
          <span className="tabular-nums">{totalCount}</span>
          {hasMore ? (
            <span className="ml-2 text-muted-foreground/70">
              · {thUi("scroll_for_more")}
            </span>
          ) : null}
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
                  <Link
                    href={`${lp}/admin/quotes/${q.id}`}
                    className="font-mono text-xs font-medium text-primary hover:underline"
                  >
                    {q.quoteNumber}
                  </Link>
                  <h3 className="mt-1 line-clamp-2 font-semibold leading-snug">{q.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {q.contactName} · {q.contactEmail}
                  </p>
                </div>
                <AdminQuoteRowActions
                  quoteId={q.id}
                  detailHref={`${lp}/admin/quotes/${q.id}`}
                  currentStatus={q.status}
                  locale={locale}
                  pdfUrl={q.pdfUrl}
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <QuoteStatusBadge status={q.status} locale={locale} validUntil={q.validUntil} />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>
                  {thUi("amount")}:{" "}
                  <span className="font-semibold text-foreground">
                    {q.total != null && !Number.isNaN(Number(q.total)) ? formatPrice(Number(q.total)) : "—"}
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
        <div ref={mobileSentinelRef} className="h-px w-full" aria-hidden />
      </div>
    </>
  );
}
