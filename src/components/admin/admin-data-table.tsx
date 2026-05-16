"use client";

import { DataTable, type DataTableProps } from "@/components/shared/data-table";
import type { ColumnDef } from "@tanstack/react-table";

type AdminDataTableProps<TData, TValue> = DataTableProps<TData, TValue> & {
  columns: ColumnDef<TData, TValue>[];
};

export function AdminDataTable<TData, TValue>({
  stickyHeader = true,
  variant = "default",
  ...props
}: AdminDataTableProps<TData, TValue>) {
  return <DataTable {...props} stickyHeader={stickyHeader} variant={variant} />;
}
