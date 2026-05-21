"use client";

import { getDay } from "date-fns";
import { Plus, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  isFutureCalendarDate,
  isTodayCalendarDate,
  parseCalendarDate,
} from "@/lib/calendar/dates";
import type { CalendarDaySummary } from "@/lib/calendar/types";

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export function CalendarDayRow({
  day,
  staffTotal,
  canWrite,
  onOpenDay,
  onAddReport,
}: {
  day: CalendarDaySummary;
  staffTotal: number;
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
  const showAdd = canWrite && !isFuture && !day.hasOwnReport;
  const dayNum = parseInt(day.date.slice(8), 10);
  const weekdayKey = WEEKDAY_KEYS[getDay(parseCalendarDate(day.date))];

  return (
    <div
      className={cn(
        "flex items-stretch gap-2 border-b border-border/50 px-3 py-2.5 last:border-b-0",
        isToday && "bg-primary/[0.04]",
        complete && !isFuture && "bg-emerald-50/50 dark:bg-emerald-950/15",
        partial && !isFuture && "bg-amber-50/40 dark:bg-amber-950/10",
        isFuture && "opacity-70"
      )}
    >
      <div className="flex w-12 shrink-0 flex-col items-center justify-center gap-0.5">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {t(`weekdays.${weekdayKey}`)}
        </span>
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg text-base font-bold tabular-nums",
            isToday
              ? "bg-primary text-primary-foreground"
              : "bg-muted/60 text-foreground"
          )}
        >
          {dayNum}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onOpenDay(day.date)}
        className="flex min-w-0 flex-1 flex-col justify-center gap-1 rounded-lg py-0.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        {!isFuture && staffTotal > 0 ? (
          staffTotal > 1 ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-foreground">
                  {t("submittedCount", {
                    submitted: day.submittedCount,
                    total: staffTotal,
                  })}
                </p>
                {day.hasOwnReport ? (
                  <span className="inline-flex shrink-0 items-center gap-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                    <Check className="h-3 w-3" />
                    {t("youSubmitted")}
                  </span>
                ) : null}
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted/80">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    complete
                      ? "bg-emerald-500"
                      : partial
                        ? "bg-amber-500"
                        : "bg-muted-foreground/30"
                  )}
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
            </>
          ) : day.hasOwnReport ? (
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              {t("youSubmitted")}
            </p>
          ) : (
            <p className="text-xs font-medium text-muted-foreground">{t("missing")}</p>
          )
        ) : isFuture ? (
          <p className="text-xs text-muted-foreground">—</p>
        ) : (
          <p className="text-xs text-muted-foreground">{t("noReport")}</p>
        )}
      </button>

      {showAdd ? (
        <button
          type="button"
          onClick={() => onAddReport(day.date)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-lg border border-border/60 bg-background text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
          aria-label={t("writeReport")}
        >
          <Plus className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
