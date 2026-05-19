"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { buildMonthGrid } from "@/lib/calendar/dates";
import type { CalendarDaySummary } from "@/lib/calendar/types";
import { CalendarDayCell } from "./calendar-day-cell";

const WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export function CalendarMonthGrid({
  year,
  month,
  days,
  staffTotal,
  canWrite,
  onOpenDay,
  onAddReport,
}: {
  year: number;
  month: number;
  days: CalendarDaySummary[];
  staffTotal: number;
  canWrite: boolean;
  onOpenDay: (date: string) => void;
  onAddReport: (date: string) => void;
}) {
  const t = useTranslations("admin.calendarPage");
  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const dayMap = useMemo(() => new Map(days.map((d) => [d.date, d])), [days]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
      <div className="grid grid-cols-7 border-b border-border/60 bg-muted/20">
        {WEEKDAY_KEYS.map((key) => (
          <div
            key={key}
            className="px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs"
          >
            {t(`weekdays.${key}`)}
          </div>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-7 gap-px bg-border/40 p-px">
        {grid.map(({ date, inMonth }) => {
          const summary = dayMap.get(date) ?? {
            date,
            submittedCount: 0,
            hasOwnReport: false,
            hasAdminReply: false,
          };
          return (
            <CalendarDayCell
              key={date}
              day={summary}
              staffTotal={staffTotal}
              inMonth={inMonth}
              canWrite={canWrite}
              onOpenDay={onOpenDay}
              onAddReport={onAddReport}
            />
          );
        })}
      </div>
    </div>
  );
}
