"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { format } from "date-fns";
import { sq, enUS } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { isFutureCalendarDate, parseCalendarDate } from "@/lib/calendar/dates";
import type { CalendarDayPayload, CalendarReportPayload } from "@/lib/calendar/types";
import { ReportReplyThread } from "./report-reply-thread";

export function DailyReportDialog({
  open,
  onOpenChange,
  date,
  locale,
  currentUserId,
  canWrite,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string | null;
  locale: string;
  currentUserId: string;
  canWrite: boolean;
  onSaved: () => void;
}) {
  const t = useTranslations("admin.calendarPage");
  const dateLocale = locale === "en" ? enUS : sq;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [body, setBody] = useState("");
  const [report, setReport] = useState<CalendarReportPayload | null>(null);

  useEffect(() => {
    if (!open || !date) {
      setBody("");
      setReport(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const res = await fetch(`/api/admin/calendar/day?date=${encodeURIComponent(date)}`);
        if (!res.ok) throw new Error();
        const data = (await res.json()) as CalendarDayPayload;
        if (cancelled) return;
        const own = data.ownReport;
        setReport(
          own
            ? {
                id: own.id,
                date,
                body: own.body,
                createdAt: own.createdAt,
                updatedAt: own.updatedAt,
                replies: own.replies,
              }
            : null
        );
        setBody(own?.body ?? "");
      } catch {
        if (!cancelled) toast.error(t("loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, date, t]);

  const isFuture = date ? isFutureCalendarDate(date) : false;
  const canEdit = canWrite && !isFuture;
  const dateLabel = date
    ? format(parseCalendarDate(date), "EEEE, d MMMM yyyy", { locale: dateLocale })
    : "";

  async function save() {
    if (!date || !canEdit) return;
    if (body.trim().length < 10) {
      toast.error(t("minChars"));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/calendar/reports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, body: body.trim() }),
      });
      if (!res.ok) throw new Error();
      const saved = (await res.json()) as CalendarReportPayload;
      setReport(saved);
      setBody(saved.body);
      toast.success(t("reportSaved"));
      onSaved();
    } catch {
      toast.error(t("loadError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto bg-white text-slate-900 sm:max-w-lg dark:bg-white dark:text-slate-900">
        <DialogHeader>
          <DialogTitle>{report ? t("editReport") : t("writeReport")}</DialogTitle>
          {dateLabel && (
            <p className="text-sm capitalize text-muted-foreground">{dateLabel}</p>
          )}
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">{t("loading")}</div>
        ) : (
          <div className="space-y-4">
            {isFuture && (
              <p className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                {t("futureDate")}
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="daily-report-body">{t("yourReport")}</Label>
              <Textarea
                id="daily-report-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                disabled={!canEdit}
                placeholder={t("reportPlaceholder")}
                className="resize-y bg-white dark:bg-white"
              />
              {canEdit && (
                <p className="text-xs text-muted-foreground">
                  {body.trim().length} / 8000 · {t("minChars")}
                </p>
              )}
            </div>

            {report && (
              <ReportReplyThread
                replies={report.replies}
                currentUserId={currentUserId}
                adminFeedbackLabel={t("adminFeedback")}
              />
            )}
          </div>
        )}

        {canEdit && (
          <DialogFooter className="sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button
              type="button"
              disabled={saving || body.trim().length < 10}
              onClick={() => void save()}
            >
              {saving ? t("saving") : t("saveReport")}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
