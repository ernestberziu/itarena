"use client";
import { useUiT } from "@/hooks/use-ui-t";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { AlertTriangle, FolderKanban, UserRound } from "lucide-react";
import { TicketStatusBadge } from "@/components/portal/ticket-status-badge";
import { PriorityBadge } from "@/components/portal/priority-badge";
import { AdminSlaTableCell } from "@/components/admin/admin-sla-table-cell";
import { AdminInfiniteTable } from "@/components/admin/admin-infinite-table";
import { UserAvatar } from "@/components/admin/users";
import { Badge } from "@/components/ui/badge";
import type { TicketStatus, Priority } from "@/types/domain";
import { divisionLabel } from "@/lib/division-labels";
import { formatDate, timeAgo } from "@/lib/utils";
import type { AdminTicketRow } from "@/lib/admin-tickets-list-dto";
import type { DataTableColumnMeta } from "@/components/shared/data-table";
import { useInfiniteList } from "@/hooks/use-infinite-list";
import { cn } from "@/lib/utils";

export type { AdminTicketRow } from "@/lib/admin-tickets-list-dto";

function stopRowNav(e: React.MouseEvent) {
  e.stopPropagation();
}

function customerName(t: AdminTicketRow): string {
  const ext = t.externalRequesterName?.trim();
  if (ext) return ext;
  return `${t.createdBy.firstName} ${t.createdBy.lastName}`.trim();
}

function TicketMetaChips({
  ticket,
  listPrefix,
  locale,
  compact,
}: {
  ticket: AdminTicketRow;
  listPrefix: string;
  locale: string;
  compact?: boolean;
}) {
  const lang = locale === "en" ? "en" : "sq";
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", compact ? "mt-1.5" : "mt-2")}>
      <Badge
        variant="secondary"
        className="h-5 max-w-[10rem] truncate border-border/50 bg-muted/60 px-1.5 text-[10px] font-medium"
      >
        {divisionLabel(ticket.division, lang)}
      </Badge>
      {ticket.project ? (
        <Link
          href={`${listPrefix}/admin/projects/${ticket.project.id}`}
          onClick={stopRowNav}
          className="inline-flex max-w-[12rem] items-center gap-1 rounded-md border border-border/50 bg-background px-1.5 py-0.5 text-[10px] font-medium text-primary/90 transition-colors hover:border-primary/30 hover:text-primary"
        >
          <FolderKanban className="h-3 w-3 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
          <span className="truncate">{ticket.project.title}</span>
        </Link>
      ) : null}
      {!ticket.assignedTo && !ticket.project ? (
        <Badge
          variant="outline"
          className="h-5 border-dashed px-1.5 text-[10px] font-normal text-muted-foreground"
        >
          {locale === "sq" ? "Pa caktim" : "Unassigned"}
        </Badge>
      ) : null}
    </div>
  );
}

function TicketMobileCard({
  ticket,
  listPrefix,
  locale,
  onOpen,
}: {
  ticket: AdminTicketRow;
  listPrefix: string;
  locale: string;
  onOpen: () => void;
}) {
  const thUi = useUiT();
  const href = `${listPrefix}/admin/tickets/${ticket.id}`;
  const name = customerName(ticket);

  return (
    <motion.article
      layout
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className={cn(
        "cursor-pointer rounded-2xl border border-border/60 bg-card p-4 shadow-sm ring-1 ring-black/[0.03] transition-colors hover:bg-muted/20 dark:ring-white/[0.05]",
        ticket.slaBreached && "border-rose-200/70 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/20"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {ticket.slaBreached ? (
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-500" strokeWidth={2} aria-hidden />
            ) : null}
            <Link
              href={href}
              onClick={stopRowNav}
              className="rounded-md bg-muted/70 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            >
              {ticket.number}
            </Link>
            <span className="text-[11px] text-muted-foreground">{timeAgo(new Date(ticket.updatedAt))}</span>
          </div>
          <Link href={href} onClick={stopRowNav} className="mt-1.5 block">
            <h3 className="line-clamp-2 font-semibold leading-snug text-foreground">{ticket.title}</h3>
          </Link>
          <TicketMetaChips ticket={ticket} listPrefix={listPrefix} locale={locale} compact />
        </div>
        <UserAvatar
          firstName={ticket.createdBy.firstName}
          lastName={ticket.createdBy.lastName}
          size="sm"
          className="h-9 w-9 shrink-0"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <TicketStatusBadge status={ticket.status as TicketStatus} locale={locale} />
        <PriorityBadge priority={ticket.priority as Priority} locale={locale} />
      </div>

      <div className="mt-3 space-y-2 border-t border-border/50 pt-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{name}</p>
          {ticket.company?.name ? (
            <p className="truncate text-xs text-muted-foreground">{ticket.company.name}</p>
          ) : (
            <p className="truncate text-xs text-muted-foreground">{ticket.createdBy.email}</p>
          )}
        </div>
        {ticket.assignedTo ? (
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <UserRound className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
            <span className="truncate">
              {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}
            </span>
          </p>
        ) : null}
        {ticket.slaDeadline ? (
          <AdminSlaTableCell
            createdAt={new Date(ticket.createdAt)}
            deadline={new Date(ticket.slaDeadline)}
            status={ticket.status as TicketStatus}
            resolvedAt={ticket.resolvedAt ? new Date(ticket.resolvedAt) : null}
            locale={locale}
          />
        ) : null}
      </div>
    </motion.article>
  );
}

export function AdminTicketsTable({
  initialTickets,
  totalCount,
  pageSize,
  locale,
  listPrefix,
  filterQuery,
  hideAssigneeColumn = false,
}: {
  initialTickets: AdminTicketRow[];
  totalCount: number;
  pageSize: number;
  locale: string;
  listPrefix: string;
  filterQuery: string;
  hideAssigneeColumn?: boolean;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const thUi = useUiT();
  const [sorting, setSorting] = useState<SortingState>([]);
  const mobileSentinelRef = useRef<HTMLDivElement>(null);

  const { rows, hasMore, loadingMore, error, scrollRef, sentinelRef, loadedCount, loadNext } =
    useInfiniteList({
      initialItems: initialTickets,
      totalCount,
      pageSize,
      filterQuery,
      fetchUrl: "/api/admin/tickets",
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

  const columns = useMemo<ColumnDef<AdminTicketRow, unknown>[]>(() => {
    const meta = (m: DataTableColumnMeta): { meta: DataTableColumnMeta } => ({ meta: m });
    const cols: ColumnDef<AdminTicketRow, unknown>[] = [
      {
        id: "number",
        accessorKey: "number",
        header: thUi("text"),
        enableSorting: true,
        ...meta({
          headerClassName: "w-[6.5rem] shrink-0",
          cellClassName: "w-[6.5rem] shrink-0 align-top",
        }),
        cell: ({ row }) => {
          const t = row.original;
          const href = `${listPrefix}/admin/tickets/${t.id}`;
          return (
            <div className="flex flex-col gap-1.5 py-0.5">
              <div className="flex items-center gap-1.5">
                {t.slaBreached ? (
                  <AlertTriangle
                    className="h-3.5 w-3.5 shrink-0 text-rose-500"
                    strokeWidth={2}
                    aria-label={thUi("sla_breached")}
                  />
                ) : null}
                <Link
                  href={href}
                  onClick={stopRowNav}
                  className="rounded-md bg-muted/70 px-2 py-1 font-mono text-[11px] font-semibold text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  {t.number}
                </Link>
              </div>
            </div>
          );
        },
      },
      {
        id: "subject",
        accessorKey: "title",
        header: thUi("ticket"),
        enableSorting: true,
        ...meta({
          headerClassName: "min-w-[14rem] w-[32%]",
          cellClassName: "min-w-[14rem] w-[32%] align-top",
        }),
        cell: ({ row }) => {
          const t = row.original;
          const href = `${listPrefix}/admin/tickets/${t.id}`;
          return (
            <div className="min-w-0 py-0.5 pr-2">
              <Link href={href} onClick={stopRowNav} className="block min-w-0">
                <p className="line-clamp-2 font-semibold leading-snug text-foreground transition-colors hover:text-primary">
                  {t.title}
                </p>
              </Link>
              <TicketMetaChips ticket={t} listPrefix={listPrefix} locale={locale} />
            </div>
          );
        },
      },
      {
        id: "customer",
        header: thUi("customer"),
        enableSorting: false,
        ...meta({
          headerClassName: "hidden md:table-cell min-w-[10rem] w-[16%]",
          cellClassName: "hidden md:table-cell min-w-[10rem] w-[16%] align-top",
        }),
        cell: ({ row }) => {
          const t = row.original;
          const name = customerName(t);
          return (
            <div className="flex min-w-0 items-start gap-2.5 py-0.5">
              <UserAvatar
                firstName={t.createdBy.firstName}
                lastName={t.createdBy.lastName}
                size="sm"
                className="h-8 w-8 shrink-0"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{name}</p>
                {t.company?.name ? (
                  <p className="truncate text-xs text-muted-foreground">{t.company.name}</p>
                ) : (
                  <p className="truncate text-xs text-muted-foreground">{t.createdBy.email}</p>
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: "state",
        header: thUi("state"),
        enableSorting: false,
        ...meta({
          headerClassName: "w-[8.5rem] shrink-0",
          cellClassName: "w-[8.5rem] shrink-0 align-top",
        }),
        cell: ({ row }) => (
          <div className="flex flex-col gap-1.5 py-0.5">
            <TicketStatusBadge
              status={row.original.status as TicketStatus}
              locale={locale}
              className="w-fit whitespace-nowrap"
            />
            <PriorityBadge priority={row.original.priority as Priority} locale={locale} />
          </div>
        ),
      },
    ];

    if (!hideAssigneeColumn) {
      cols.push({
        id: "assignee",
        header: thUi("assignee"),
        enableSorting: false,
        ...meta({
          headerClassName: "hidden lg:table-cell min-w-[8rem] w-[12%]",
          cellClassName: "hidden lg:table-cell min-w-[8rem] w-[12%] align-top",
        }),
        cell: ({ row }) => {
          const { assignedTo } = row.original;
          if (!assignedTo) {
            return (
              <span className="text-xs text-muted-foreground/60">{locale === "sq" ? "—" : "—"}</span>
            );
          }
          return (
            <div className="flex min-w-0 items-center gap-2 py-0.5">
              <UserAvatar
                firstName={assignedTo.firstName}
                lastName={assignedTo.lastName}
                size="sm"
                className="h-7 w-7 shrink-0 text-[10px]"
              />
              <span className="truncate text-xs font-medium text-foreground">
                {assignedTo.firstName} {assignedTo.lastName}
              </span>
            </div>
          );
        },
      });
    }

    cols.push(
      {
        id: "activity",
        accessorKey: "updatedAt",
        header: thUi("updated"),
        enableSorting: true,
        ...meta({
          headerClassName: "hidden sm:table-cell w-[6.5rem] shrink-0",
          cellClassName: "hidden sm:table-cell w-[6.5rem] shrink-0 align-top",
        }),
        cell: ({ row }) => (
          <div className="py-0.5" title={formatDate(new Date(row.original.updatedAt))}>
            <p className="text-xs font-medium tabular-nums text-foreground">
              {timeAgo(new Date(row.original.updatedAt))}
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground tabular-nums">
              {formatDate(new Date(row.original.createdAt))}
            </p>
          </div>
        ),
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
      }
    );

    return cols;
  }, [hideAssigneeColumn, listPrefix, locale]);

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

  const emptyMessage = thUi("no_tickets_found");

  return (
    <>
      <div className="hidden lg:block">
        <AdminInfiniteTable
          table={table}
          locale={locale}
          labels={{
            entitySq: "bileta",
            entityEn: "tickets",
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
          onRowClick={openTicket}
          getRowId={(r) => r.id}
          rowClassName={(r) =>
            r.slaBreached
              ? "bg-rose-50/50 hover:bg-rose-50/80 dark:bg-rose-950/15 dark:hover:bg-rose-950/30"
              : undefined
          }
          firstColumnId="number"
          lastColumnId="sla"
          minTableWidth="980px"
        />
      </div>

      <div className="space-y-3 border-t border-border/60 px-4 py-3 lg:hidden">
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
          rows.map((ticket, i) => (
            <motion.div
              key={ticket.id}
              {...(!reduceMotion
                ? { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 } }
                : {})}
              transition={{ duration: reduceMotion ? 0 : 0.2, delay: reduceMotion ? 0 : i * 0.03 }}
            >
              <TicketMobileCard
                ticket={ticket}
                listPrefix={listPrefix}
                locale={locale}
                onOpen={() => openTicket(ticket)}
              />
            </motion.div>
          ))
        )}
        {loadingMore ? (
          <p className="py-2 text-center text-xs text-muted-foreground">{thUi("loading")}</p>
        ) : null}
        {error ? <p className="text-center text-xs text-destructive">{error}</p> : null}
        <div ref={mobileSentinelRef} className="h-px w-full" aria-hidden />
      </div>
    </>
  );
}
