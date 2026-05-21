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
import { AnimatePresence, motion } from "framer-motion";
import { Building2, ShoppingBag, Ticket, Users } from "lucide-react";
import { AdminInfiniteTable } from "@/components/admin/admin-infinite-table";
import { useInfiniteList } from "@/hooks/use-infinite-list";
import { formatDate } from "@/lib/utils";
import type { AdminCompanyRow } from "@/types/admin-company";
import { AdminCompanyRowActions } from "@/components/admin/admin-company-row-actions";

export type { AdminCompanyRow } from "@/types/admin-company";

export function AdminCompaniesTable({
  initialCompanies,
  totalCount,
  pageSize,
  locale,
  lp,
  filterQuery,
}: {
  initialCompanies: AdminCompanyRow[];
  totalCount: number;
  pageSize: number;
  locale: string;
  lp: string;
  filterQuery: string;
}) {
  const router = useRouter();
  const thUi = useUiT();
  const [sorting, setSorting] = useState<SortingState>([]);
  const mobileSentinelRef = useRef<HTMLDivElement>(null);

  const { rows, hasMore, loadingMore, error, scrollRef, sentinelRef, loadedCount, loadNext } =
    useInfiniteList({
      initialItems: initialCompanies,
      totalCount,
      pageSize,
      filterQuery,
      fetchUrl: "/api/admin/companies",
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

  const columns = useMemo<ColumnDef<AdminCompanyRow>[]>(() => {
    return [
      {
        id: "company",
        accessorFn: (row) => row.name.toLowerCase(),
        header: thUi("company"),
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <Link
                href={`${lp}/admin/companies/${row.original.id}`}
                className="font-medium truncate hover:text-primary"
                onClick={(e) => e.stopPropagation()}
              >
                {row.original.name}
              </Link>
              <p className="text-xs text-muted-foreground truncate">
                {row.original.vatNumber || thUi("no_vat")}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "location",
        accessorFn: (row) => row.city?.toLowerCase() ?? "",
        header: thUi("city"),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.city || "—"}</span>
        ),
      },
      {
        id: "members",
        accessorFn: (row) => row._count.users,
        header: thUi("members_2"),
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5 text-sm tabular-nums text-muted-foreground">
            <Users className="h-3.5 w-3.5 shrink-0" />
            {row.original._count.users}
          </span>
        ),
      },
      {
        id: "tickets",
        accessorFn: (row) => row._count.tickets,
        header: thUi("tickets_2"),
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5 text-sm tabular-nums text-muted-foreground">
            <Ticket className="h-3.5 w-3.5 shrink-0" />
            {row.original._count.tickets}
          </span>
        ),
      },
      {
        id: "orders",
        accessorFn: (row) => row._count.orders,
        header: thUi("orders_2"),
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5 text-sm tabular-nums text-muted-foreground">
            <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
            {row.original._count.orders}
          </span>
        ),
      },
      {
        id: "created",
        accessorFn: (row) => row.createdAt,
        header: thUi("created"),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{formatDate(row.original.createdAt)}</span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">{thUi("actions")}</span>,
        enableSorting: false,
        cell: ({ row }) => (
          <div
            className="sticky right-0 bg-gradient-to-l from-card from-80% to-transparent pl-2 md:pl-4"
            onClick={(e) => e.stopPropagation()}
          >
            <AdminCompanyRowActions company={row.original} locale={locale} lp={lp} />
          </div>
        ),
      },
    ];
  }, [lp, locale, thUi]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (r) => r.id,
  });

  return (
    <>
      <div className="hidden md:block">
        <AdminInfiniteTable
          table={table}
          locale={locale}
          labels={{
            entitySq: "kompaní",
            entityEn: "companies",
            emptySq: "Nuk u gjetën kompani",
            emptyEn: "No companies found",
          }}
          totalCount={totalCount}
          loadedCount={loadedCount}
          hasMore={hasMore}
          loadingMore={loadingMore}
          error={error}
          scrollRef={scrollRef}
          sentinelRef={sentinelRef}
          onRowClick={(row) => router.push(`${lp}/admin/companies/${row.id}`)}
          getRowId={(r) => r.id}
          minTableWidth="920px"
          lastColumnId="actions"
        />
      </div>

      <div className="md:hidden space-y-3">
        <AnimatePresence initial={false}>
          {rows.map((c, i) => (
            <motion.div
              key={c.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, delay: Math.min(i * 0.03, 0.24) }}
              className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]"
              onClick={() => router.push(`${lp}/admin/companies/${c.id}`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold leading-tight">{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {c.vatNumber || thUi("no_vat")}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {c._count.users}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Ticket className="h-3.5 w-3.5" />
                        {c._count.tickets}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ShoppingBag className="h-3.5 w-3.5" />
                        {c._count.orders}
                      </span>
                    </div>
                  </div>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <AdminCompanyRowActions company={c} locale={locale} lp={lp} />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loadingMore ? (
          <p className="py-2 text-center text-xs text-muted-foreground">{thUi("loading")}</p>
        ) : null}
        <div ref={mobileSentinelRef} className="h-1" />
      </div>
    </>
  );
}
