"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { getTodayInTz } from "@/lib/calendar/dates";
import type { CalendarMonthPayload } from "@/lib/calendar/types";
import { CalendarToolbar } from "./calendar-toolbar";
import { CalendarMonthGrid } from "./calendar-month-grid";
import { DailyReportDialog } from "./daily-report-dialog";
import { DayReviewDialog } from "./day-review-dialog";

export function CalendarWorkspace({
  locale,
  currentUserId,
  isAdmin,
  canWrite,
  className,
}: {
  locale: string;
  currentUserId: string;
  isAdmin: boolean;
  canWrite: boolean;
  className?: string;
}) {
  const t = useTranslations("admin.calendarPage");
  const today = getTodayInTz();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [data, setData] = useState<CalendarMonthPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const [reportDate, setReportDate] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reviewDate, setReviewDate] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const loadMonth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/calendar/month?year=${year}&month=${month}`
      );
      if (!res.ok) throw new Error();
      setData((await res.json()) as CalendarMonthPayload);
    } catch {
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [year, month, t]);

  useEffect(() => {
    void loadMonth();
  }, [loadMonth]);

  function goPrevMonth() {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goNextMonth() {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  function goToday() {
    const now = getTodayInTz();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
  }

  function openDay(date: string) {
    if (isAdmin) {
      setReviewDate(date);
      setReviewOpen(true);
    } else {
      setReportDate(date);
      setReportOpen(true);
    }
  }

  function openAddReport(date: string) {
    setReportDate(date);
    setReportOpen(true);
  }

  return (
    <div className={className}>
      <div className="flex h-full min-h-0 flex-col gap-4">
        <CalendarToolbar
          locale={locale}
          year={year}
          month={month}
          data={data}
          isAdmin={isAdmin}
          onPrevMonth={goPrevMonth}
          onNextMonth={goNextMonth}
          onToday={goToday}
        />

        {loading && !data ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-border/60 bg-card text-sm text-muted-foreground">
            {t("loading")}
          </div>
        ) : data ? (
          <CalendarMonthGrid
            year={year}
            month={month}
            days={data.days}
            staffTotal={data.staffTotal}
            canWrite={canWrite}
            onOpenDay={openDay}
            onAddReport={openAddReport}
          />
        ) : null}
      </div>

      <DailyReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        date={reportDate}
        locale={locale}
        currentUserId={currentUserId}
        canWrite={canWrite}
        onSaved={() => void loadMonth()}
      />

      {isAdmin && (
        <DayReviewDialog
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          date={reviewDate}
          locale={locale}
          currentUserId={currentUserId}
          onReplySent={() => void loadMonth()}
        />
      )}
    </div>
  );
}
