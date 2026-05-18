"use client";

import {
  flexRender,
  type Table as TanStackTable,
} from "@tanstack/react-table";
import { ChevronsUpDown, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DataTableColumnMeta } from "@/components/shared/data-table";

export type AdminInfiniteTableLabels = {
  entitySq: string;
  entityEn: string;
  emptySq: string;
  emptyEn: string;
  scrollMoreSq?: string;
  scrollMoreEn?: string;
};

type AdminInfiniteTableProps<TData> = {
  table: TanStackTable<TData>;
  locale: string;
  labels: AdminInfiniteTableLabels;
  totalCount: number;
  loadedCount: number;
  hasMore: boolean;
  loadingMore: boolean;
  error: string | null;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  onRowClick?: (row: TData) => void;
  getRowId?: (row: TData) => string;
  rowClassName?: (row: TData) => string | undefined;
  minTableWidth?: string;
  firstColumnId?: string;
  lastColumnId?: string;
  /** Rendered above the count toolbar (e.g. bulk actions). */
  bulkActions?: React.ReactNode;
};

export function AdminInfiniteTable<TData>({
  table,
  locale,
  labels,
  totalCount,
  loadedCount,
  hasMore,
  loadingMore,
  error,
  scrollRef,
  sentinelRef,
  onRowClick,
  getRowId,
  rowClassName,
  minTableWidth = "640px",
  firstColumnId,
  lastColumnId,
  bulkActions,
}: AdminInfiniteTableProps<TData>) {
  const th = (sq: string, en: string) => (locale === "sq" ? sq : en);
  const entity = th(labels.entitySq, labels.entityEn);
  const emptyMsg = th(labels.emptySq, labels.emptyEn);
  const scrollHint = th(
    labels.scrollMoreSq ?? "lëviz për më shumë",
    labels.scrollMoreEn ?? "scroll for more"
  );
  const colCount = table.getVisibleLeafColumns().length;
  const resolvedFirst = firstColumnId ?? table.getVisibleLeafColumns()[0]?.id;
  const resolvedLast =
    lastColumnId ?? table.getVisibleLeafColumns()[colCount - 1]?.id;

  return (
    <div className="flex flex-col">
      {bulkActions ? <div className="border-b border-border/60 px-4 py-2.5">{bulkActions}</div> : null}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/20 px-4 py-2.5">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium tabular-nums text-foreground">{loadedCount}</span>
          <span className="text-muted-foreground/70"> / </span>
          <span className="tabular-nums">{totalCount}</span>
          <span className="ml-1">{entity}</span>
          {hasMore ? (
            <span className="ml-2 text-muted-foreground/70">· {scrollHint}</span>
          ) : null}
        </p>
        {loadingMore ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            {th("Duke ngarkuar…", "Loading…")}
          </span>
        ) : null}
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>

      <div ref={scrollRef} className="max-h-[min(70vh,900px)] overflow-auto">
        <table
          className="w-full border-collapse text-sm"
          style={{ minWidth: minTableWidth }}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border/60">
                {headerGroup.headers.map((header) => {
                  const colMeta = header.column.columnDef.meta as DataTableColumnMeta | undefined;
                  const isFirst = header.column.id === resolvedFirst;
                  const isLast = header.column.id === resolvedLast;
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      className={cn(
                        "sticky top-0 z-10 bg-muted/95 px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm",
                        colMeta?.headerClassName,
                        isFirst && "pl-4",
                        isLast && "pr-4"
                      )}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
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
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border/50">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                const extra = rowClassName?.(row.original);
                const rowKey = getRowId?.(row.original) ?? row.id;
                return (
                  <tr
                    key={rowKey}
                    tabIndex={onRowClick ? 0 : undefined}
                    className={cn(
                      onRowClick &&
                        "cursor-pointer transition-colors hover:bg-muted/35 focus-visible:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                      extra
                    )}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                    onKeyDown={
                      onRowClick
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onRowClick(row.original);
                            }
                          }
                        : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => {
                      const colMeta = cell.column.columnDef.meta as DataTableColumnMeta | undefined;
                      const isFirst = cell.column.id === resolvedFirst;
                      const isLast = cell.column.id === resolvedLast;
                      return (
                        <td
                          key={cell.id}
                          className={cn(
                            "px-3 py-3 align-middle",
                            colMeta?.cellClassName,
                            isFirst && "pl-4",
                            isLast && "pr-4"
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={colCount} className="px-4 py-16 text-center text-sm text-muted-foreground">
                  {emptyMsg}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div ref={sentinelRef} className="h-px w-full shrink-0" aria-hidden />
      </div>
    </div>
  );
}
