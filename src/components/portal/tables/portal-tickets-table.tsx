"use client";
import { useUiT } from "@/hooks/use-ui-t";

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
import { TicketStatusBadge } from "@/components/portal/ticket-status-badge";
import { PriorityBadge } from "@/components/portal/priority-badge";
import { AdminInfiniteTable } from "@/components/admin/admin-infinite-table";
import { Badge } from "@/components/ui/badge";
import type { TicketStatus, Priority } from "@/types/domain";
import { portalTicketOpenedByLabel } from "@/lib/portal/client-branding";
import { divisionLabel } from "@/lib/division-labels";
import { formatDate, timeAgo } from "@/lib/utils";
import type { DataTableColumnMeta } from "@/components/shared/data-table";

export type PortalTicketRow = {
  id: string;
  number: string;
  title: string;
  status: string;
  priority: string;
  division: string;
  createdAt: string;
  updatedAt: string;
  createdBy: { firstName: string; lastName: string; role: string };
  assignedTo: { firstName: string; lastName: string } | null;
};

function stopRowNav(e: React.MouseEvent) {
  e.stopPropagation();
}

function PortalTicketMobileCard({
  ticket,
  lp,
  locale,
  companyScope,
  onOpen,
}: {
  ticket: PortalTicketRow;
  lp: string;
  locale: string;
  companyScope: boolean;
  onOpen: () => void;
}) {
  const href = `${lp}/portal/tickets/${ticket.id}`;
  const lang = locale === "en" ? "en" : "sq";

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
      className="cursor-pointer rounded-2xl border border-border/60 bg-card p-4 shadow-sm ring-1 ring-black/[0.03] transition-colors hover:bg-muted/20 dark:ring-white/[0.05]"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
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
          <Badge
            variant="secondary"
            className="mt-1.5 h-5 max-w-[10rem] truncate border-border/50 bg-muted/60 px-1.5 text-[10px] font-medium"
          >
            {divisionLabel(ticket.division, lang)}
          </Badge>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <TicketStatusBadge status={ticket.status as TicketStatus} locale={locale} />
        <PriorityBadge priority={ticket.priority as Priority} locale={locale} />
      </div>

      <div className="mt-3 space-y-2 border-t border-border/50 pt-3">
        <p className="text-xs text-muted-foreground">
          {locale === "sq" ? "Hapur nga" : "Opened by"}:{" "}
          {portalTicketOpenedByLabel(ticket.createdBy, locale === "en" ? "en" : "sq")}
        </p>
      </div>
    </motion.article>
  );
}

export function PortalTicketsTable({
  rows,
  locale,
  lp,
  companyScope,
}: {
  rows: PortalTicketRow[];
  locale: string;
  lp: string;
  companyScope: boolean;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const thUi = useUiT();
  const [sorting, setSorting] = useState<SortingState>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const totalCount = rows.length;

  const columns = useMemo<ColumnDef<PortalTicketRow, unknown>[]>(() => {
    const meta = (m: DataTableColumnMeta): { meta: DataTableColumnMeta } => ({ meta: m });
    const cols: ColumnDef<PortalTicketRow, unknown>[] = [
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
          const href = `${lp}/portal/tickets/${t.id}`;
          return (
            <Link
              href={href}
              onClick={stopRowNav}
              className="rounded-md bg-muted/70 px-2 py-1 font-mono text-[11px] font-semibold text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            >
              {t.number}
            </Link>
          );
        },
      },
      {
        id: "subject",
        accessorKey: "title",
        header: thUi("ticket"),
        enableSorting: true,
        ...meta({
          headerClassName: "min-w-[14rem] w-[36%]",
          cellClassName: "min-w-[14rem] w-[36%] align-top",
        }),
        cell: ({ row }) => {
          const t = row.original;
          const href = `${lp}/portal/tickets/${t.id}`;
          const lang = locale === "en" ? "en" : "sq";
          return (
            <div className="min-w-0 py-0.5 pr-2">
              <Link href={href} onClick={stopRowNav} className="block min-w-0">
                <p className="line-clamp-2 font-semibold leading-snug text-foreground transition-colors hover:text-primary">
                  {t.title}
                </p>
              </Link>
              <Badge
                variant="secondary"
                className="mt-1.5 h-5 max-w-[10rem] truncate border-border/50 bg-muted/60 px-1.5 text-[10px] font-medium"
              >
                {divisionLabel(t.division, lang)}
              </Badge>
            </div>
          );
        },
      },
    ];

    if (companyScope) {
      cols.push({
        id: "requester",
        header: thUi("opened_by"),
        enableSorting: false,
        ...meta({
          headerClassName: "hidden md:table-cell min-w-[8rem] w-[14%]",
          cellClassName: "hidden md:table-cell min-w-[8rem] w-[14%] align-top",
        }),
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {portalTicketOpenedByLabel(row.original.createdBy, locale === "en" ? "en" : "sq")}
          </span>
        ),
      });
    }

    cols.push(
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
            <p className="mt-0.5 text-[10px] tabular-nums text-muted-foreground">
              {formatDate(new Date(row.original.createdAt))}
            </p>
          </div>
        ),
      }
    );

    return cols;
  }, [companyScope, locale, lp]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const openTicket = useCallback(
    (row: PortalTicketRow) => {
      router.push(`${lp}/portal/tickets/${row.id}`);
    },
    [lp, router]
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
          loadedCount={totalCount}
          hasMore={false}
          loadingMore={false}
          error={null}
          scrollRef={scrollRef}
          sentinelRef={sentinelRef}
          onRowClick={openTicket}
          getRowId={(r) => r.id}
          firstColumnId="number"
          lastColumnId="activity"
          minTableWidth="820px"
        />
      </div>

      <div className="space-y-3 border-t border-border/60 px-4 py-3 lg:hidden">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium tabular-nums text-foreground">{totalCount}</span>
          <span className="ml-1">{thUi("tickets")}</span>
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
              <PortalTicketMobileCard
                ticket={ticket}
                lp={lp}
                locale={locale}
                companyScope={companyScope}
                onOpen={() => openTicket(ticket)}
              />
            </motion.div>
          ))
        )}
      </div>
    </>
  );
}
