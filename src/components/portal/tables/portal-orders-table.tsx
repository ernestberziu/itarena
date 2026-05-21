"use client";
import { useUiT } from "@/hooks/use-ui-t";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { formatDate, formatPrice, cn } from "@/lib/utils";
import {
  PortalOrderDetailPanel,
  type PortalOrderRow,
} from "@/components/portal/tables/portal-order-detail-panel";

export function PortalOrdersTable({
  rows,
  locale,
  companyScope,
  codNotice,
}: {
  rows: PortalOrderRow[];
  locale: string;
  companyScope: boolean;
  codNotice: string;
}) {
  const thUi = useUiT();
  const reduceMotion = useReducedMotion();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [rows]
  );

  return (
    <>
      <div className="hidden lg:block">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/20 px-4 py-2.5">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium tabular-nums text-foreground">{rows.length}</span>
            <span className="ml-1">{thUi("orders")}</span>
          </p>
        </div>
        <div className="max-h-[min(70vh,900px)] overflow-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/60">
                <th className="sticky top-0 z-10 w-10 bg-muted/95 px-3 py-2.5 backdrop-blur-sm" scope="col" />
                <th className="sticky top-0 z-10 bg-muted/95 px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm" scope="col">
                  {thUi("order")}
                </th>
                <th className="sticky top-0 z-10 bg-muted/95 px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm" scope="col">
                  {thUi("status")}
                </th>
                <th className="sticky top-0 z-10 bg-muted/95 px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm" scope="col">
                  {thUi("items")}
                </th>
                <th className="sticky top-0 z-10 bg-muted/95 px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm" scope="col">
                  {thUi("total")}
                </th>
                <th className="sticky top-0 z-10 bg-muted/95 px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm" scope="col">
                  {thUi("date")}
                </th>
                {companyScope ? (
                  <th className="sticky top-0 z-10 bg-muted/95 px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm" scope="col">
                    {thUi("opened_by")}
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {sortedRows.length === 0 ? (
                <tr>
                  <td colSpan={companyScope ? 7 : 6} className="px-4 py-16 text-center text-sm text-muted-foreground">
                    {thUi("no_orders_found")}
                  </td>
                </tr>
              ) : (
                sortedRows.map((order) => {
                  const expanded = expandedId === order.id;
                  return (
                    <tr key={order.id} className="group">
                      <td colSpan={companyScope ? 7 : 6} className="p-0">
                        <button
                          type="button"
                          className="flex w-full cursor-pointer items-center transition-colors hover:bg-muted/35"
                          onClick={() => setExpandedId(expanded ? null : order.id)}
                          aria-expanded={expanded}
                        >
                          <span className="flex w-10 shrink-0 items-center justify-center py-3">
                            {expanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                            )}
                          </span>
                          <span className="w-[8rem] shrink-0 py-3 pl-0 pr-3 font-mono text-xs font-medium text-foreground">
                            {order.orderNumber}
                          </span>
                          <span className="w-[8.5rem] shrink-0 py-3 pr-3">
                            <OrderStatusBadge status={order.status} locale={locale} />
                          </span>
                          <span className="w-[5rem] shrink-0 py-3 pr-3 tabular-nums text-sm">{order.items.length}</span>
                          <span className="w-[7rem] shrink-0 py-3 pr-3 font-semibold tabular-nums">
                            {formatPrice(order.total)}
                          </span>
                          <span className="w-[6.5rem] shrink-0 py-3 pr-3 text-xs text-muted-foreground">
                            {formatDate(new Date(order.createdAt))}
                          </span>
                          {companyScope ? (
                            <span className="min-w-0 flex-1 py-3 pr-4 text-sm font-medium">
                              {order.user.firstName} {order.user.lastName}
                            </span>
                          ) : (
                            <span className="flex-1" />
                          )}
                        </button>
                        {expanded ? (
                          <PortalOrderDetailPanel order={order} locale={locale} codNotice={codNotice} />
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 border-t border-border/60 px-4 py-3 lg:hidden">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium tabular-nums text-foreground">{rows.length}</span>
          <span className="ml-1">{thUi("orders")}</span>
        </p>
        {sortedRows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-16 text-center text-sm text-muted-foreground">
            {thUi("no_orders_found")}
          </div>
        ) : (
          sortedRows.map((order, i) => {
            const expanded = expandedId === order.id;
            return (
              <motion.article
                key={order.id}
                layout
                {...(!reduceMotion ? { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 } } : {})}
                transition={{ duration: reduceMotion ? 0 : 0.2, delay: reduceMotion ? 0 : i * 0.03 }}
                className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]"
              >
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-3 p-4 text-left transition-colors hover:bg-muted/20"
                  onClick={() => setExpandedId(expanded ? null : order.id)}
                  aria-expanded={expanded}
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold">{order.orderNumber}</span>
                      <OrderStatusBadge status={order.status} locale={locale} />
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        {order.items.length} {thUi("items_2")}
                      </span>
                      <span className="font-semibold tabular-nums text-foreground">{formatPrice(order.total)}</span>
                      <span>{formatDate(new Date(order.createdAt))}</span>
                    </div>
                    {companyScope ? (
                      <p className="text-xs text-muted-foreground">
                        {thUi("opened_by")}: {order.user.firstName} {order.user.lastName}
                      </p>
                    ) : null}
                  </div>
                  <ChevronDown
                    className={cn("mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")}
                    strokeWidth={2}
                  />
                </button>
                {expanded ? (
                  <PortalOrderDetailPanel order={order} locale={locale} codNotice={codNotice} />
                ) : null}
              </motion.article>
            );
          })
        )}
      </div>
    </>
  );
}
