"use client";
import { useUiT } from "@/hooks/use-ui-t";

import { useCallback, useMemo, useState } from "react";
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
import type { ProjectListRow } from "@/lib/projects/types";
import { projectStatusBadgeClass, projectStatusLabel } from "@/lib/projects/status-ui";
import type { DataTableColumnMeta } from "@/components/shared/data-table";
import { useInfiniteList } from "@/hooks/use-infinite-list";
import { useMobileInfiniteSentinel } from "@/hooks/use-mobile-infinite-sentinel";
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
  const reduceMotion = useReducedMotion();
  const en = locale === "en";
  const thUi = useUiT();
  const [sorting, setSorting] = useState<SortingState>([]);

  const { rows, hasMore, loadingMore, error, scrollRef, sentinelRef, loadedCount, loadNext } =
    useInfiniteList({
      initialItems: initialRows,
      totalCount,
      pageSize,
      filterQuery,
      fetchUrl: "/api/admin/projects",
      getRowId: (r) => r.id,
      locale,
    });

  const mobileSentinelRef = useMobileInfiniteSentinel(loadNext);

  const openProject = useCallback(
    (row: ProjectListRow) => {
      router.push(`${listPrefix}/admin/projects/${row.id}`);
    },
    [listPrefix, router]
  );

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
          <span className="text-xs text-muted-foreground tabular-nums">
            {timeAgo(new Date(row.original.updatedAt))}
          </span>
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

  const emptyMessage = thUi("no_projects");

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
          loadedCount={loadedCount}
          hasMore={hasMore}
          loadingMore={loadingMore}
          error={error}
          scrollRef={scrollRef}
          sentinelRef={sentinelRef}
          onRowClick={openProject}
          getRowId={(r) => r.id}
          minTableWidth="800px"
          firstColumnId="project"
          lastColumnId="actions"
        />
      </div>

      <div className="space-y-3 border-t border-border/60 px-0 py-3 lg:hidden">
        <p className="text-xs text-muted-foreground px-1">
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
              {...(!reduceMotion
                ? { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 } }
                : {})}
              transition={{ duration: reduceMotion ? 0 : 0.2, delay: reduceMotion ? 0 : i * 0.03 }}
              className="cursor-pointer rounded-2xl border border-border/60 bg-card p-4 shadow-sm ring-1 ring-black/[0.03] transition-colors hover:bg-muted/20 dark:ring-white/[0.05]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold leading-snug">{project.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {project.createdBy.firstName} {project.createdBy.lastName}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                    {thUi("clients")}: {project._count.clients} · {thUi("tickets_2")}:{" "}
                    {project._count.tickets}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {timeAgo(new Date(project.updatedAt))}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-medium",
                      projectStatusBadgeClass(project.status)
                    )}
                  >
                    {projectStatusLabel(project.status, locale)}
                  </Badge>
                  <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                    <ProjectRowActions
                      detailHref={`${listPrefix}/admin/projects/${project.id}`}
                      canWrite={canWrite}
                      locale={locale}
                    />
                  </div>
                </div>
              </div>
            </motion.article>
          ))
        )}
        {loadingMore ? (
          <p className="py-2 text-center text-xs text-muted-foreground">
            {thUi("loading")}
          </p>
        ) : null}
        {error ? <p className="text-center text-xs text-destructive">{error}</p> : null}
        <div ref={mobileSentinelRef} className="h-px w-full" aria-hidden />
      </div>
    </>
  );
}
