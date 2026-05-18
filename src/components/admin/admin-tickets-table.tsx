"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { AlertTriangle, ChevronsUpDown, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { TicketStatusBadge } from "@/components/portal/ticket-status-badge";
import { PriorityBadge } from "@/components/portal/priority-badge";
import { SlaIndicator } from "@/components/portal/sla-indicator";
import type { TicketStatus, Priority } from "@/types/domain";
import { DIVISION_LABELS } from "@/lib/sla";
import { cn } from "@/lib/utils";
import type { AdminTicketRow } from "@/lib/admin-tickets-list-dto";

export type { AdminTicketRow } from "@/lib/admin-tickets-list-dto";

export function AdminTicketsTable({
  initialTickets,
  totalCount,
  pageSize,
  locale,
  listPrefix,
  filterQuery,
}: {
  initialTickets: AdminTicketRow[];
  totalCount: number;
  pageSize: number;
  locale: string;
  listPrefix: string;
  /** Query string for filters only (no `page` / `pageSize`). */
  filterQuery: string;
}) {
  const [rows, setRows] = useState<AdminTicketRow[]>(initialTickets);
  const [hasMore, setHasMore] = useState(initialTickets.length < totalCount);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  const pageRef = useRef(1);
  const hasMoreRef = useRef(hasMore);
  const loadingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    pageRef.current = 1;
    setRows(initialTickets);
    setHasMore(initialTickets.length < totalCount);
    setError(null);
  }, [initialTickets, totalCount, filterQuery]);

  const loadNext = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    setLoadingMore(true);
    setError(null);
    const nextPage = pageRef.current + 1;
    try {
      const qs = new URLSearchParams(filterQuery);
      qs.set("page", String(nextPage));
      qs.set("pageSize", String(pageSize));
      const res = await fetch(`/api/admin/tickets?${qs.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as {
        items: AdminTicketRow[];
        hasMore: boolean;
      };
      setRows((prev) => {
        const seen = new Set(prev.map((r) => r.id));
        const merged = [...prev];
        for (const row of data.items) {
          if (!seen.has(row.id)) {
            seen.add(row.id);
            merged.push(row);
          }
        }
        return merged;
      });
      pageRef.current = nextPage;
      hasMoreRef.current = data.hasMore;
      setHasMore(data.hasMore);
    } catch {
      setError(locale === "sq" ? "Ngarkimi dështoi" : "Failed to load more");
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, [filterQuery, pageSize, locale]);

  useEffect(() => {
    const root = scrollRef.current;
    const target = sentinelRef.current;
    if (!root || !target) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadNext();
      },
      { root, rootMargin: "120px", threshold: 0 }
    );
    obs.observe(target);
    return () => obs.disconnect();
  }, [loadNext]);

  const isStatusPriorityColumn = (columnId: string) => columnId === "statusAndPriority";

  const columns = useMemo<ColumnDef<AdminTicketRow>[]>(() => {
    const th = (sq: string, en: string) => (locale === "sq" ? sq : en);
    return [
      {
        accessorKey: "number",
        header: th("Nr.", "No."),
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            {row.original.slaBreached && (
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-500" strokeWidth={2} aria-hidden />
            )}
            <Link
              href={`${listPrefix}/admin/tickets/${row.original.id}`}
              className="font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              {row.original.number}
            </Link>
          </div>
        ),
      },
      {
        accessorKey: "title",
        header: th("Titulli", "Title"),
        cell: ({ row }) => (
          <div className="max-w-[14rem] sm:max-w-xs md:max-w-md">
            <Link href={`${listPrefix}/admin/tickets/${row.original.id}`} className="group/link block">
              <p className="truncate font-medium transition-colors group-hover/link:text-primary">
                {row.original.title}
              </p>
            </Link>
          </div>
        ),
      },
      {
        id: "customer",
        header: th("Klienti", "Customer"),
        cell: ({ row }) => {
          const ext = row.original.externalRequesterName?.trim();
          const name = ext
            ? ext
            : `${row.original.createdBy.firstName} ${row.original.createdBy.lastName}`.trim();
          return (
            <div className="max-w-[12rem]">
              <p className="break-words text-xs font-medium leading-snug text-foreground">{name}</p>
              {row.original.company?.name ? (
                <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                  {row.original.company.name}
                </p>
              ) : null}
            </div>
          );
        },
      },
      {
        id: "statusAndPriority",
        enableSorting: false,
        header: () => (
          <span className="flex flex-col items-center gap-0.5 normal-case">
            <span>{th("Statusi", "Status")}</span>
            <span>{th("Prioriteti", "Priority")}</span>
          </span>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col items-center justify-center gap-1.5 py-0.5">
            <TicketStatusBadge
              status={row.original.status as TicketStatus}
              locale={locale}
              className="max-w-[11rem] whitespace-normal"
            />
            <PriorityBadge
              priority={row.original.priority as Priority}
              locale={locale}
              className="max-w-[11rem] whitespace-normal"
            />
          </div>
        ),
      },
      {
        id: "project",
        header: th("Projekti", "Project"),
        cell: ({ row }) =>
          row.original.project ? (
            <Link
              href={`${listPrefix}/admin/projects/${row.original.project.id}`}
              className="text-xs text-muted-foreground hover:text-primary truncate max-w-[8rem] block"
            >
              {row.original.project.title}
            </Link>
          ) : (
            <span className="text-xs text-muted-foreground/50">—</span>
          ),
      },
      {
        accessorKey: "division",
        header: th("Divizioni", "Division"),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {DIVISION_LABELS[row.original.division]?.[locale as "sq" | "en"] ?? row.original.division}
          </span>
        ),
      },
      {
        id: "assigned",
        header: th("Caktuar", "Assignee"),
        cell: ({ row }) =>
          row.original.assignedTo ? (
            <span className="whitespace-nowrap text-xs text-muted-foreground">
              {row.original.assignedTo.firstName} {row.original.assignedTo.lastName}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/50">—</span>
          ),
      },
      {
        id: "sla",
        header: "SLA",
        cell: ({ row }) =>
          row.original.slaDeadline ? (
            <SlaIndicator
              createdAt={new Date(row.original.createdAt)}
              deadline={new Date(row.original.slaDeadline)}
              status={row.original.status as TicketStatus}
              resolvedAt={
                row.original.resolvedAt ? new Date(row.original.resolvedAt) : null
              }
              locale={locale}
            />
          ) : (
            <span className="text-xs text-muted-foreground/50">—</span>
          ),
      },
    ];
  }, [listPrefix, locale]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-3">
      <div className="overflow-hidden admin-card-elevated">
        <div
          ref={scrollRef}
          className="max-h-[min(70vh,900px)] overflow-x-auto overflow-y-auto"
        >
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b bg-muted/30">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        "sticky top-0 z-10 bg-muted/90 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground shadow-[inset_0_-1px_0_0_hsl(var(--border))] backdrop-blur-md whitespace-nowrap",
                        isStatusPriorityColumn(header.column.id)
                          ? "min-w-[9rem] max-w-[12rem] text-center align-middle normal-case whitespace-normal"
                          : "text-left"
                      )}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          className={cn(
                            "flex items-center gap-1 transition-colors hover:text-foreground",
                            isStatusPriorityColumn(header.column.id) && "w-full justify-center"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getIsSorted() === "asc" ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronsUpDown className="h-3 w-3 opacity-40" />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "cursor-pointer border-b transition-colors duration-150 ease-out last:border-0 hover:bg-muted/40 focus-within:bg-muted/25",
                      row.original.slaBreached &&
                        "bg-rose-50/50 hover:bg-rose-50/80 dark:bg-rose-950/25 dark:hover:bg-rose-950/35"
                    )}
                    onClick={() => {
                      window.location.assign(`${listPrefix}/admin/tickets/${row.original.id}`);
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cn(
                          "px-4 py-3 align-middle",
                          isStatusPriorityColumn(cell.column.id)
                            ? "min-w-[9rem] max-w-[12rem] text-center whitespace-normal"
                            : "text-left tabular-nums"
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center text-sm text-muted-foreground">
                    {locale === "sq" ? "Nuk u gjetën bileta" : "No tickets found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div ref={sentinelRef} className="h-px w-full shrink-0" aria-hidden />
        </div>
      </div>

      {(loadingMore || error) && (
        <div className="flex flex-col items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
          {loadingMore && (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {locale === "sq" ? "Duke ngarkuar…" : "Loading more…"}
            </span>
          )}
          {error && <p className="text-destructive">{error}</p>}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground tabular-nums">
        {locale === "sq" ? "Shfaqur" : "Showing"}{" "}
        <span className="font-medium text-foreground">{rows.length}</span> / {totalCount}{" "}
        {locale === "sq" ? "bileta" : "tickets"}
        {hasMore ? (
          <span className="text-muted-foreground/80">
            {" "}
            · {locale === "sq" ? "lëviz poshtë për më shumë" : "scroll for more"}
          </span>
        ) : rows.length > 0 ? (
          <span className="text-muted-foreground/80">
            {" "}
            · {locale === "sq" ? "fund i listës" : "end of list"}
          </span>
        ) : null}
      </p>
    </div>
  );
}
