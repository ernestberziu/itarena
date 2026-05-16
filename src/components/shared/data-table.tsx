"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  type Table,
  type VisibilityState,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

/** Optional per-column classes via `columnDef.meta` (TanStack Table). */
export type DataTableColumnMeta = {
  headerClassName?: string;
  cellClassName?: string;
};

export type DataTableVariant = "default" | "adminSaaS";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  pageSize?: number;
  onRowClick?: (row: TData) => void;
  toolbar?: React.ReactNode;
  /** Sticky header + elevated chrome for admin list surfaces */
  stickyHeader?: boolean;
  /** Premium row/header spacing and hover chrome (orders/tickets/catalog stay on default) */
  variant?: DataTableVariant;
  /** Pagination summary language */
  paginationLocale?: "sq" | "en";
  /** Replaces default empty row message */
  emptyMessage?: string;
  /** Optional row selection (leading checkbox column). Requires rowSelection + onRowSelectionChange. */
  enableRowSelection?: boolean;
  getRowId?: (row: TData) => string;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  /** Rendered above the table; receives the table instance (e.g. bulk toolbar). */
  bulkActions?: (table: Table<TData>) => React.ReactNode;
  /** Extra class on outer wrapper */
  className?: string;
  /** Per-row classes (e.g. highlight SLA breached) */
  rowClassName?: (row: TData) => string | undefined;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Kërko...",
  pageSize = 20,
  onRowClick,
  toolbar,
  stickyHeader = false,
  variant = "default",
  paginationLocale = "sq",
  emptyMessage = "Nuk u gjetën rezultate",
  enableRowSelection = false,
  getRowId,
  rowSelection,
  onRowSelectionChange,
  bulkActions,
  className,
  rowClassName,
}: DataTableProps<TData, TValue>) {
  const saas = variant === "adminSaaS";
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const defaultGetRowId = React.useCallback((row: TData) => {
    const r = row as { id?: unknown };
    if (typeof r.id === "string") return r.id;
    throw new Error("DataTable: enableRowSelection requires getRowId or rows with string `id`");
  }, []);

  const resolvedGetRowId = getRowId ?? defaultGetRowId;

  const [internalRowSelection, setInternalRowSelection] = React.useState<RowSelectionState>({});
  const rowSelectionState = enableRowSelection
    ? rowSelection !== undefined
      ? rowSelection
      : internalRowSelection
    : undefined;
  const onRowSelectionStateChange = enableRowSelection
    ? onRowSelectionChange ?? setInternalRowSelection
    : undefined;

  const selectionColumn = React.useMemo<ColumnDef<TData, unknown>>(
    () => ({
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center pr-1" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(v === true)}
            aria-label="Select all on page"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center pr-1" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(v === true)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      size: 40,
    }),
    []
  );

  const tableColumns = React.useMemo(() => {
    if (!enableRowSelection) return columns;
    return [selectionColumn, ...columns];
  }, [enableRowSelection, selectionColumn, columns]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getRowId: enableRowSelection ? resolvedGetRowId : undefined,
    enableRowSelection: enableRowSelection,
    onRowSelectionChange: enableRowSelection ? onRowSelectionStateChange : undefined,
    initialState: { pagination: { pageSize } },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      ...(enableRowSelection && rowSelectionState !== undefined ? { rowSelection: rowSelectionState } : {}),
    },
  });

  const colCount = table.getVisibleLeafColumns().length;

  return (
    <div className={cn("space-y-3", className)}>
      {bulkActions ? <div className="flex flex-wrap items-center gap-2">{bulkActions(table)}</div> : null}
      {/* Toolbar */}
      {(searchKey || toolbar) && (
        <div className="flex items-center gap-3 flex-wrap">
          {searchKey && (
            <Input
              placeholder={searchPlaceholder}
              value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
              onChange={(e) =>
                table.getColumn(searchKey)?.setFilterValue(e.target.value)
              }
              className="max-w-xs h-9 text-sm"
            />
          )}
          {toolbar}
        </div>
      )}

      {/* Table */}
      <div
        className={cn(
          "overflow-hidden admin-card-elevated",
          saas && "rounded-2xl ring-1 ring-black/[0.04] dark:ring-white/[0.06]"
        )}
      >
        <div className="overflow-x-auto max-h-[min(70vh,900px)]">
          <table className={cn("w-full min-w-[920px] table-auto text-sm", saas && "text-[13px]")}>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className={cn(
                    "border-b bg-muted/30",
                    saas && "bg-muted/45",
                    stickyHeader && saas && "shadow-[0_1px_0_0_hsl(var(--border))]"
                  )}
                >
                  {headerGroup.headers.map((header) => {
                    const colMeta = header.column.columnDef.meta as DataTableColumnMeta | undefined;
                    return (
                    <th
                      key={header.id}
                      scope="col"
                      className={cn(
                        "text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap",
                        saas ? "px-5 py-3.5" : "px-4 py-3",
                        header.column.id === "select" && "w-10 min-w-10 max-w-10 px-2",
                        stickyHeader &&
                          cn(
                            "sticky top-0 z-10 bg-muted/90 backdrop-blur-md shadow-[inset_0_-1px_0_0_hsl(var(--border))]",
                            saas && "bg-muted/95 shadow-[inset_0_-1px_0_0_hsl(var(--border)),0_4px_12px_-4px_rgba(0,0,0,0.12)] dark:shadow-[inset_0_-1px_0_0_hsl(var(--border)),0_4px_14px_-6px_rgba(0,0,0,0.45)]"
                          ),
                        colMeta?.headerClassName
                      )}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                          onClick={header.column.getToggleSortingHandler()}
                          aria-sort={
                            header.column.getIsSorted() === "asc"
                              ? "ascending"
                              : header.column.getIsSorted() === "desc"
                                ? "descending"
                                : "none"
                          }
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getIsSorted() === "asc" ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronsUpDown className="h-3 w-3 opacity-40" />
                          )}
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b last:border-0 transition-[background-color,box-shadow,transform] duration-150 ease-out focus-within:bg-muted/25 outline-none",
                      onRowClick
                        ? "cursor-pointer hover:bg-muted/40"
                        : "hover:bg-muted/30",
                      saas && "motion-safe:hover:-translate-y-px motion-safe:hover:shadow-sm",
                      row.getIsSelected() && "bg-primary/[0.06]",
                      rowClassName?.(row.original)
                    )}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const colMeta = cell.column.columnDef.meta as DataTableColumnMeta | undefined;
                      return (
                      <td
                        key={cell.id}
                        className={cn(
                          "tabular-nums",
                          saas ? "px-5 py-4" : "px-4 py-3",
                          cell.column.id === "select" && "w-10 min-w-10 max-w-10 px-2",
                          colMeta?.cellClassName
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={colCount}
                    className="text-center text-muted-foreground py-16 text-sm"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div
          className={cn(
            "flex items-center justify-between text-sm text-muted-foreground",
            saas && "rounded-xl border border-border/50 bg-muted/15 px-3 py-2"
          )}
        >
          <span>
            {paginationLocale === "en" ? (
              <>
                {table.getFilteredRowModel().rows.length} results · Page{" "}
                {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </>
            ) : (
              <>
                {table.getFilteredRowModel().rows.length} rezultate · Faqja{" "}
                {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
              </>
            )}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
