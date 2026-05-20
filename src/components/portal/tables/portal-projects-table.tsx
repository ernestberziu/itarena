"use client";

import { useCallback, useMemo, useRef, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { timeAgo, cn } from "@/lib/utils";
import { projectStatusBadgeClass, projectStatusLabel } from "@/lib/projects/status-ui";
import type { DataTableColumnMeta } from "@/components/shared/data-table";
import type { ProjectStatus } from "@/lib/projects/types";

export type PortalProjectRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  updatedAt: string;
};

export function PortalProjectsTable({
  rows,
  locale,
  lp,
}: {
  rows: PortalProjectRow[];
  locale: string;
  lp: string;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const en = locale === "en";
  const [sorting, setSorting] = useState<SortingState>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const totalCount = rows.length;
  const emptyMessage = en ? "No projects found." : "Nuk u gjetën projekte.";

  const columns = useMemo<ColumnDef<PortalProjectRow>[]>(() => {
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
              href={`${lp}/portal/projects/${row.original.id}`}
              className="font-medium hover:text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              {row.original.title}
            </Link>
            {row.original.description ? (
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{row.original.description}</p>
            ) : null}
          </div>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        header: en ? "Status" : "Statusi",
        enableSorting: true,
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn("text-[10px] font-medium", projectStatusBadgeClass(row.original.status as ProjectStatus))}
          >
            {projectStatusLabel(row.original.status as ProjectStatus, locale)}
          </Badge>
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
    ];
  }, [en, locale, lp]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const openProject = useCallback(
    (row: PortalProjectRow) => {
      router.push(`${lp}/portal/projects/${row.id}`);
    },
    [lp, router]
  );

  return (
    <>
      <div className="hidden lg:block">
        <AdminInfiniteTable
          table={table}
          locale={locale}
          labels={{
            entitySq: "projekte",
            entityEn: "projects",
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
          onRowClick={openProject}
          getRowId={(r) => r.id}
          minTableWidth="640px"
        />
      </div>

      <div className="space-y-3 border-t border-border/60 px-4 py-3 lg:hidden">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium tabular-nums text-foreground">{totalCount}</span>
          <span className="ml-1">{en ? "projects" : "projekte"}</span>
        </p>
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-16 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          rows.map((project, i) => (
            <motion.article
              key={project.id}
              layout
              role="button"
              tabIndex={0}
              onClick={() => openProject(project)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openProject(project);
                }
              }}
              {...(!reduceMotion ? { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 } } : {})}
              transition={{ duration: reduceMotion ? 0 : 0.2, delay: reduceMotion ? 0 : i * 0.03 }}
              className="cursor-pointer rounded-2xl border border-border/60 bg-card p-4 shadow-sm ring-1 ring-black/[0.03] transition-colors hover:bg-muted/20 dark:ring-white/[0.05]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold leading-snug">{project.title}</h3>
                  {project.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-muted-foreground">{timeAgo(new Date(project.updatedAt))}</p>
                </div>
                <Badge
                  variant="outline"
                  className={cn("shrink-0 text-[10px] font-medium", projectStatusBadgeClass(project.status as ProjectStatus))}
                >
                  {projectStatusLabel(project.status as ProjectStatus, locale)}
                </Badge>
              </div>
            </motion.article>
          ))
        )}
      </div>
    </>
  );
}
