"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import { enUS, sq } from "date-fns/locale";
import {
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronRight,
  Printer,
  Receipt,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { getTodayCalendarDate } from "@/lib/calendar/dates";
import { buildPosDailySalesPrintHtml } from "@/lib/pos/build-daily-sales-print-html";
import { printHtmlDocument } from "@/lib/print-html-document";
import { posCashClientDisplayName } from "@/lib/pos/cash-client";
import type { PosDailySalesPayload, PosDailySalesStaffRow } from "@/lib/pos/types";
import { staffRoleLabelFromRole } from "@/lib/staff-role-labels";
import type { Role } from "@/types/domain";

function customerLabel(
  sale: PosDailySalesStaffRow["sales"][0],
  locale: string
): string {
  return sale.isCashClient ? posCashClientDisplayName(locale) : sale.customerName;
}

export function AdminPosDailySalesSheet({
  open,
  onOpenChange,
  locale,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: string;
}) {
  const en = locale === "en";
  const t = (sq: string, e: string) => (en ? e : sq);
  const dateLocale = en ? enUS : sq;
  const [date, setDate] = useState(getTodayCalendarDate());
  const [data, setData] = useState<PosDailySalesPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedStaff, setExpandedStaff] = useState<Set<string>>(new Set());

  const periodLabel = useMemo(() => {
    try {
      return format(parseISO(date), "EEEE, d MMMM yyyy", { locale: dateLocale });
    } catch {
      return date;
    }
  }, [date, dateLocale]);

  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setDate(getTodayCalendarDate());
    }
    wasOpenRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) {
      setData(null);
      setLoading(false);
      setExpandedStaff(new Set());
      return;
    }

    let cancelled = false;
    setLoading(true);

    void fetch(`/api/admin/pos/daily-sales?date=${encodeURIComponent(date)}`)
      .then(async (res) => {
        const json = (await res.json()) as PosDailySalesPayload & { error?: string };
        if (!res.ok) throw new Error(json.error ?? "Failed");
        if (!cancelled) {
          setData(json);
          setExpandedStaff(new Set(json.staff.map((s) => s.userId)));
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setData(null);
          setExpandedStaff(new Set());
          const msg = e instanceof Error ? e.message : en ? "Error" : "Gabim";
          toast.error(msg);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, date, en]);

  function toggleStaff(userId: string) {
    setExpandedStaff((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  function printReport() {
    if (!data) return;
    const html = buildPosDailySalesPrintHtml(data, locale);
    const ok = printHtmlDocument(html);
    if (!ok) {
      toast.error(
        t("Printimi dështoi. Provoni përsëri.", "Print failed. Please try again.")
      );
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
      >
        <SheetHeader className="space-y-1 border-b border-border/60 bg-muted/20 px-5 py-4 text-left">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="h-4 w-4" strokeWidth={2} aria-hidden />
            </div>
            <div>
              <SheetTitle className="text-base">
                {t("Shitjet ditore POS", "Daily POS sales")}
              </SheetTitle>
              <p className="text-xs font-normal text-muted-foreground">
                {t(
                  "Çfarë ka shitur çdo punonjës (pa partnerët).",
                  "What each staff member sold (partners excluded)."
                )}
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4">
          <section className="mb-4 rounded-xl border border-border/60 bg-card p-4 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              {t("Periudha", "Period")}
            </div>
            <Label htmlFor="pos-report-date" className="sr-only">
              {t("Data", "Date")}
            </Label>
            <Input
              id="pos-report-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-background"
            />
            <p className="mt-2 text-xs text-muted-foreground">{periodLabel}</p>
          </section>

          {loading ? (
            <div className="space-y-3 py-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-lg bg-muted/50"
                  aria-hidden
                />
              ))}
            </div>
          ) : data && data.staff.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/15 px-6 py-12 text-center">
              <Receipt className="mb-3 h-10 w-10 text-muted-foreground/50" strokeWidth={1.5} aria-hidden />
              <p className="text-sm font-medium text-foreground">
                {t("Nuk ka shitje", "No sales")}
              </p>
              <p className="mt-1 max-w-[280px] text-xs text-muted-foreground">
                {t(
                  "Nuk u regjistruan shitje POS për këtë datë.",
                  "No POS sales were recorded for this date."
                )}
              </p>
            </div>
          ) : data ? (
            <>
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/60 bg-gradient-to-br from-primary/[0.06] to-transparent p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("Totali", "Total")}
                  </p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-primary">
                    {formatPrice(data.grandTotal)}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-card p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("Shitje", "Sales")}
                  </p>
                  <p className="mt-1 text-lg font-bold tabular-nums">{data.grandCount}</p>
                </div>
              </div>

              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Users className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  {t("Detajet sipas stafit", "Details by staff")}
                </div>
                <Badge variant="secondary" className="text-[10px] font-medium">
                  {data.staff.length} {t("punonjës", "staff")}
                </Badge>
              </div>

              <div className="space-y-3">
                {data.staff.map((row) => {
                  const isOpen = expandedStaff.has(row.userId);
                  return (
                    <div
                      key={row.userId}
                      className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]"
                    >
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
                        onClick={() => toggleStaff(row.userId)}
                      >
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2} />
                        ) : (
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2} />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">
                            {row.firstName} {row.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {staffRoleLabelFromRole(row.role as Role, en ? "en" : "sq")} ·{" "}
                            {row.saleCount} {t("shitje", "sales")}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-bold tabular-nums text-primary">
                          {formatPrice(row.total)}
                        </p>
                      </button>

                      {isOpen ? (
                        <div className="space-y-3 border-t border-border/60 bg-muted/10 px-3 py-3">
                          {row.sales.map((sale) => (
                            <div
                              key={sale.orderId}
                              className="overflow-hidden rounded-lg border border-border/50 bg-background"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 bg-muted/20 px-3 py-2">
                                <div className="min-w-0">
                                  <p className="font-mono text-xs font-semibold text-primary">
                                    {sale.orderNumber}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {formatDateTime(sale.createdAt)} · {customerLabel(sale, locale)}
                                  </p>
                                </div>
                                <p className="text-sm font-semibold tabular-nums">
                                  {formatPrice(sale.orderTotal)}
                                </p>
                              </div>
                              <ul className="divide-y divide-border/40">
                                {sale.items.map((item, idx) => (
                                  <li
                                    key={`${sale.orderId}-${item.sku ?? idx}`}
                                    className="flex items-start justify-between gap-3 px-3 py-2 text-xs"
                                  >
                                    <div className="min-w-0">
                                      <p className="font-medium leading-snug">{item.name}</p>
                                      {item.sku ? (
                                        <p className="font-mono text-[10px] text-muted-foreground">
                                          {item.sku}
                                        </p>
                                      ) : null}
                                    </div>
                                    <div className="shrink-0 text-right tabular-nums">
                                      <p>
                                        {item.quantity} × {formatPrice(item.price)}
                                      </p>
                                      <p className="font-semibold">{formatPrice(item.lineTotal)}</p>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>

        <div className="border-t border-border/60 bg-muted/10 px-5 py-4">
          <Button
            type="button"
            className="w-full gap-2 shadow-sm"
            disabled={!data || loading || (data?.staff.length ?? 0) === 0}
            onClick={printReport}
          >
            <Printer className="h-4 w-4" strokeWidth={2} aria-hidden />
            {t("Printo raportin", "Print report")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
