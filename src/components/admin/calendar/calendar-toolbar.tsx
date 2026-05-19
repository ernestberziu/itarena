"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { format, parseISO } from "date-fns";
import { sq, enUS } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CalendarMonthPayload } from "@/lib/calendar/types";
import { CalendarPrintDialog } from "./calendar-print-dialog";

export function CalendarToolbar({
  locale,
  year,
  month,
  data,
  isAdmin,
  onPrevMonth,
  onNextMonth,
  onToday,
}: {
  locale: string;
  year: number;
  month: number;
  data: CalendarMonthPayload | null;
  isAdmin: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}) {
  const t = useTranslations("admin.calendarPage");
  const dateLocale = locale === "en" ? enUS : sq;
  const label = format(parseISO(`${year}-${String(month).padStart(2, "0")}-01`), "MMMM yyyy", {
    locale: dateLocale,
  });

  const monthPct =
    data && data.monthPossibleTotal > 0
      ? Math.round((data.monthSubmittedTotal / data.monthPossibleTotal) * 100)
      : 0;

  const viewingCurrentMonth =
    data &&
    data.todayDate.startsWith(`${year}-${String(month).padStart(2, "0")}`);

  return (
    <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={onPrevMonth}
            aria-label={t("prevMonth")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="min-w-[10rem] px-2 text-center text-base font-semibold capitalize sm:text-lg">
            {label}
          </h2>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={onNextMonth}
            aria-label={t("nextMonth")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && <CalendarPrintDialog locale={locale} year={year} month={month} />}
          <Button type="button" variant="secondary" size="sm" onClick={onToday}>
            {t("today")}
          </Button>
        </div>
      </div>

      {data && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground sm:text-sm">
              <span>
                {t("monthProgress", {
                  submitted: data.monthSubmittedTotal,
                  total: data.monthPossibleTotal,
                })}
              </span>
              <span className="font-medium tabular-nums text-foreground">{monthPct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full bg-primary transition-all")}
                style={{ width: `${monthPct}%` }}
              />
            </div>
          </div>
          {viewingCurrentMonth && (
            <div className="shrink-0 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-medium tabular-nums">
              {t("submittedCount", {
                submitted: data.todaySubmittedCount,
                total: data.staffTotal,
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
