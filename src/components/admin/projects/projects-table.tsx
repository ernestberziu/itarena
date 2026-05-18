"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { AdminInfiniteTable } from "@/components/admin/admin-infinite-table";
import { Badge } from "@/components/ui/badge";
import { timeAgo, cn } from "@/lib/utils";
import type { ProjectListRow } from "@/lib/projects/types";
import { projectStatusBadgeClass, projectStatusLabel } from "@/lib/projects/status-ui";
import type { DataTableColumnMeta } from "@/components/shared/data-table";
import { useInfiniteList } from "@/hooks/use-infinite-list";
import { ProjectRowActions } from "@/components/admin/projects/project-row-actions";

export function ProjectsTable({
  initialRows,
  totalCount,
  pageSize,
  listPrefix,
  locale,
  filterQuery,
  canWrite = false,
}: {
  initialRows: ProjectListRow[];
  totalCount: number;
  pageSize: number;
  listPrefix: string;
  locale: string;
  filterQuery: string;
  canWrite?: boolean;
}) {
  const router = useRouter();
  const en = locale === "en";
  const [sorting, setSorting] = useState<SortingState>([]);

  const { rows, hasMore, loadingMore, error, scrollRef, sentinelRef, loadedCount } =
    useInfiniteList({
      initialItems: initialRows,
      totalCount,
      pageSize,
      filterQuery,
      fetchUrl: "/api/admin/projects",
      getRowId: (r) => r.id,
      locale,
    });

  const columns = useMemo<ColumnDef<ProjectListRow>[]>(() => {
    const meta = (m: DataTableColumnMeta) => ({ meta: m });
    return [
      {
        id: "project",
        accessorKey: "title",
        header: en ? "Project" : "Projekti",
        enableSorting: true,
        ...meta({
          headerClassName: "min-w-[12rem]",
          cellClassName: "min-w-[12rem]",
        }),
        cell: ({ row }) => (
          <div className="min-w-0">
            <Link
              href={`${listPrefix}/admin/projects/${row.original.id}`}
              className="font-medium hover:text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              {row.original.title}
            </Link>
            <div className="mt-0.5 flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-medium",
                  projectStatusBadgeClass(row.original.status)
                )}
              >
                {projectStatusLabel(row.original.status, locale)}
              </Badge>
            </div>
          </div>
        ),
      },
      {
        id: "clients",
        accessorFn: (r) => r._count.clients,
        header: en ? "Clients" : "Klientët",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">{row.original._count.clients}</span>
        ),
      },
      {
        id: "tickets",
        accessorFn: (r) => r._count.tickets,
        header: en ? "Tickets" : "Biletat",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">{row.original._count.tickets}</span>
        ),
      },
      {
        id: "team",
        accessorFn: (r) => r._count.members,
        header: en ? "Team" : "Ekipi",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">{row.original._count.members}</span>
        ),
      },
      {
        id: "updated",
        accessorKey: "updatedAt",
        header: en ? "Updated" : "Përditësuar",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">{timeAgo(new Date(row.original.updatedAt))}</span>
        ),
      },
      {
        id: "actions",
        header: en ? "Actions" : "Veprime",
        enableSorting: false,
        cell: ({ row }) => (
          <ProjectRowActions
            detailHref={`${listPrefix}/admin/projects/${row.original.id}`}
            canWrite={canWrite}
            locale={locale}
          />
        ),
      },
    ];
  }, [canWrite, en, listPrefix, locale]);

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
        entitySq: "projekte",
        entityEn: "projects",
        emptySq: "Nuk ka projekte",
        emptyEn: "No projects",
      }}
      totalCount={totalCount}
      loadedCount={loadedCount}
      hasMore={hasMore}
      loadingMore={loadingMore}
      error={error}
      scrollRef={scrollRef}
      sentinelRef={sentinelRef}
      onRowClick={(row) => router.push(`${listPrefix}/admin/projects/${row.id}`)}
      getRowId={(r) => r.id}
      minTableWidth="800px"
      firstColumnId="project"
      lastColumnId="actions"
    />
  );
}
