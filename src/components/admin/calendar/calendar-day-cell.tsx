"use client";

import { Plus, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { isFutureCalendarDate, isTodayCalendarDate } from "@/lib/calendar/dates";
import type { CalendarDaySummary } from "@/lib/calendar/types";

export function CalendarDayCell({
  day,
  staffTotal,
  inMonth,
  canWrite,
  onOpenDay,
  onAddReport,
}: {
  day: CalendarDaySummary;
  staffTotal: number;
  inMonth: boolean;
  canWrite: boolean;
  onOpenDay: (date: string) => void;
  onAddReport: (date: string) => void;
}) {
  const t = useTranslations("admin.calendarPage");
  const isFuture = isFutureCalendarDate(day.date);
  const isToday = isTodayCalendarDate(day.date);
  const complete = staffTotal > 0 && day.submittedCount >= staffTotal;
  const partial = day.submittedCount > 0 && !complete;
  const progress = staffTotal > 0 ? (day.submittedCount / staffTotal) * 100 : 0;
  const showAdd =
    canWrite && !isFuture && inMonth && !day.hasOwnReport;

  return (
    <div
      className={cn(
        "group relative flex min-h-[88px] flex-col rounded-xl border p-2 transition-colors sm:min-h-[100px] sm:p-2.5",
        inMonth ? "border-border/60 bg-card" : "border-transparent bg-muted/20 opacity-60",
        isToday && inMonth && "ring-2 ring-primary/40 ring-offset-1 ring-offset-background",
        complete && inMonth && !isFuture && "border-emerald-200/70 bg-emerald-50/40 dark:bg-emerald-950/20",
        partial && inMonth && !isFuture && "border-amber-200/60 bg-amber-50/30 dark:bg-amber-950/15",
        isFuture && inMonth && "opacity-70"
      )}
    >
      <button
        type="button"
        disabled={!inMonth}
        onClick={() => inMonth && onOpenDay(day.date)}
        className={cn(
          "flex min-h-0 flex-1 flex-col text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded-lg",
          !inMonth && "cursor-default"
        )}
      >
        <div className="flex items-start justify-between gap-1">
          <span
            className={cn(
              "inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-semibold tabular-nums",
              isToday && inMonth
                ? "bg-primary text-primary-foreground"
                : "text-foreground"
            )}
          >
            {parseInt(day.date.slice(8), 10)}
          </span>
          {showAdd && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onAddReport(day.date);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onAddReport(day.date);
                }
              }}
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground opacity-0 shadow-sm transition-opacity hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/40 group-hover:opacity-100"
              aria-label={t("writeReport")}
            >
              <Plus className="h-3.5 w-3.5" />
            </span>
          )}
        </div>

        {inMonth && !isFuture && staffTotal > 0 && (
          <div className="mt-auto space-y-1.5 pt-2">
            {staffTotal > 1 ? (
              <>
                <div className="h-1 overflow-hidden rounded-full bg-muted/80">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      complete ? "bg-emerald-500" : partial ? "bg-amber-500" : "bg-muted-foreground/30"
                    )}
                    style={{ width: `${Math.min(100, progress)}%` }}
                  />
                </div>
                <p className="text-[10px] font-medium tabular-nums text-muted-foreground sm:text-xs">
                  {t("submittedCount", {
                    submitted: day.submittedCount,
                    total: staffTotal,
                  })}
                </p>
              </>
            ) : day.hasOwnReport ? (
              <p className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 sm:text-xs">
                {t("youSubmitted")}
              </p>
            ) : (
              <p className="text-[10px] font-medium text-muted-foreground sm:text-xs">{t("missing")}</p>
            )}
          </div>
        )}

        {day.hasOwnReport && inMonth && staffTotal > 1 && (
          <span className="mt-1 inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
            <Check className="h-3 w-3" />
            {t("youSubmitted")}
          </span>
        )}
      </button>
    </div>
  );
}
