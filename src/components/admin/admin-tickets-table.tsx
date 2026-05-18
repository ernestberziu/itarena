"use client";

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
import { AlertTriangle, FolderKanban, UserRound } from "lucide-react";
import { TicketStatusBadge } from "@/components/portal/ticket-status-badge";
import { PriorityBadge } from "@/components/portal/priority-badge";
import { AdminSlaTableCell } from "@/components/admin/admin-sla-table-cell";
import { AdminInfiniteTable } from "@/components/admin/admin-infinite-table";
import type { TicketStatus, Priority } from "@/types/domain";
import { DIVISION_LABELS } from "@/lib/sla";
import { timeAgo } from "@/lib/utils";
import type { AdminTicketRow } from "@/lib/admin-tickets-list-dto";
import type { DataTableColumnMeta } from "@/components/shared/data-table";
import { useInfiniteList } from "@/hooks/use-infinite-list";

export type { AdminTicketRow } from "@/lib/admin-tickets-list-dto";

function stopRowNav(e: React.MouseEvent) {
  e.stopPropagation();
}

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
  filterQuery: string;
}) {
  const router = useRouter();
  const th = (sq: string, en: string) => (locale === "sq" ? sq : en);
  const [sorting, setSorting] = useState<SortingState>([]);

  const { rows, hasMore, loadingMore, error, scrollRef, sentinelRef, loadedCount } =
    useInfiniteList({
      initialItems: initialTickets,
      totalCount,
      pageSize,
      filterQuery,
      fetchUrl: "/api/admin/tickets",
      getRowId: (r) => r.id,
      locale,
    });

  const columns = useMemo<ColumnDef<AdminTicketRow, unknown>[]>(() => {
    const meta = (m: DataTableColumnMeta): { meta: DataTableColumnMeta } => ({ meta: m });

    return [
      {
        id: "ticket",
        accessorKey: "title",
        header: th("Bileta", "Ticket"),
        enableSorting: true,
        ...meta({
          headerClassName: "min-w-[12rem] w-[28%] max-w-md",
          cellClassName: "min-w-[12rem] w-[28%] max-w-md",
        }),
        cell: ({ row }) => {
          const t = row.original;
          const divLabel =
            DIVISION_LABELS[t.division]?.[locale as "sq" | "en"] ?? t.division;
          return (
            <div className="min-w-0 space-y-1 py-0.5">
              <div className="flex items-center gap-2">
                {t.slaBreached ? (
                  <AlertTriangle
                    className="h-3.5 w-3.5 shrink-0 text-red-500"
                    strokeWidth={2}
                    aria-label={th("SLA e shkelur", "SLA breached")}
                  />
                ) : (
                  <span className="w-3.5 shrink-0" aria-hidden />
                )}
                <Link
                  href={`${listPrefix}/admin/tickets/${t.id}`}
                  onClick={stopRowNav}
                  className="font-mono text-[11px] text-muted-foreground transition-colors hover:text-primary"
                >
                  {t.number}
                </Link>
                <span className="hidden text-[11px] text-muted-foreground/80 sm:inline">
                  · {timeAgo(new Date(t.updatedAt))}
                </span>
              </div>
              <Link
                href={`${listPrefix}/admin/tickets/${t.id}`}
                onClick={stopRowNav}
                className="block min-w-0"
              >
                <p className="truncate font-medium leading-snug text-foreground transition-colors hover:text-primary">
                  {t.title}
                </p>
              </Link>
              {t.project ? (
                <Link
                  href={`${listPrefix}/admin/projects/${t.project.id}`}
                  onClick={stopRowNav}
                  className="inline-flex max-w-full items-center gap-1 text-[11px] font-medium text-primary/90 transition-colors hover:text-primary"
                >
                  <FolderKanban className="h-3 w-3 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                  <span className="truncate">{t.project.title}</span>
                </Link>
              ) : null}
              <p className="truncate text-[11px] text-muted-foreground">{divLabel}</p>
              {!t.project && t.assignedTo ? (
                <p className="truncate text-[11px] text-muted-foreground lg:hidden">
                  <span className="inline-flex items-center gap-1">
                    <UserRound className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
                    {t.assignedTo.firstName} {t.assignedTo.lastName}
                  </span>
                </p>
              ) : null}
            </div>
          );
        },
      },
      {
        id: "customer",
        header: th("Klienti", "Customer"),
        enableSorting: false,
        ...meta({
          headerClassName: "hidden md:table-cell min-w-[9rem] w-[16%]",
          cellClassName: "hidden md:table-cell min-w-[9rem] w-[16%]",
        }),
        cell: ({ row }) => {
          const ext = row.original.externalRequesterName?.trim();
          const name = ext
            ? ext
            : `${row.original.createdBy.firstName} ${row.original.createdBy.lastName}`.trim();
          return (
            <div className="min-w-0 max-w-[14rem]">
              <p className="truncate text-sm font-medium text-foreground">{name}</p>
              {row.original.company?.name ? (
                <p className="truncate text-xs text-muted-foreground">{row.original.company.name}</p>
              ) : null}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: th("Statusi", "Status"),
        enableSorting: true,
        ...meta({
          headerClassName: "w-[7.5rem]",
          cellClassName: "w-[7.5rem]",
        }),
        cell: ({ row }) => (
          <TicketStatusBadge
            status={row.original.status as TicketStatus}
            locale={locale}
            className="whitespace-nowrap"
          />
        ),
      },
      {
        accessorKey: "priority",
        header: th("Prioriteti", "Priority"),
        enableSorting: true,
        ...meta({
          headerClassName: "hidden sm:table-cell w-[6.5rem]",
          cellClassName: "hidden sm:table-cell w-[6.5rem]",
        }),
        cell: ({ row }) => (
          <PriorityBadge priority={row.original.priority as Priority} locale={locale} />
        ),
      },
      {
        id: "team",
        header: th("Caktuar", "Assignee"),
        enableSorting: false,
        ...meta({
          headerClassName: "hidden lg:table-cell min-w-[8rem] w-[12%]",
          cellClassName: "hidden lg:table-cell min-w-[8rem] w-[12%]",
        }),
        cell: ({ row }) => {
          const { project, assignedTo } = row.original;
          if (project) {
            return <span className="text-xs text-muted-foreground/50">—</span>;
          }
          if (assignedTo) {
            return (
              <span className="inline-flex max-w-full items-center gap-1.5 text-xs text-muted-foreground">
                <UserRound className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                <span className="truncate">
                  {assignedTo.firstName} {assignedTo.lastName}
                </span>
              </span>
            );
          }
          return <span className="text-xs text-muted-foreground/50">—</span>;
        },
      },
      {
        id: "sla",
        header: "SLA",
        enableSorting: false,
        ...meta({
          headerClassName: "min-w-[8.5rem] w-[11%]",
          cellClassName: "min-w-[8.5rem] w-[11%] align-top",
        }),
        cell: ({ row }) =>
          row.original.slaDeadline ? (
            <AdminSlaTableCell
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

  const openTicket = useCallback(
    (row: AdminTicketRow) => {
      router.push(`${listPrefix}/admin/tickets/${row.id}`);
    },
    [listPrefix, router]
  );

  return (
    <AdminInfiniteTable
      table={table}
      locale={locale}
      labels={{
        entitySq: "bileta",
        entityEn: "tickets",
        emptySq: "Nuk u gjetën bileta",
        emptyEn: "No tickets found",
      }}
      totalCount={totalCount}
      loadedCount={loadedCount}
      hasMore={hasMore}
      loadingMore={loadingMore}
      error={error}
      scrollRef={scrollRef}
      sentinelRef={sentinelRef}
      onRowClick={openTicket}
      getRowId={(r) => r.id}
      rowClassName={(r) =>
        r.slaBreached
          ? "bg-rose-50/60 hover:bg-rose-50/90 dark:bg-rose-950/20 dark:hover:bg-rose-950/35"
          : undefined
      }
      firstColumnId="ticket"
      lastColumnId="sla"
    />
  );
}
