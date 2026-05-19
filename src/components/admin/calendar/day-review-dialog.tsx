"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { format } from "date-fns";
import { sq, enUS } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { parseCalendarDate } from "@/lib/calendar/dates";
import type { CalendarDayPayload, CalendarStaffDayRow } from "@/lib/calendar/types";
import { ReportReplyThread } from "./report-reply-thread";

function staffInitials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

export function DayReviewDialog({
  open,
  onOpenChange,
  date,
  locale,
  currentUserId,
  onReplySent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string | null;
  locale: string;
  currentUserId: string;
  onReplySent: () => void;
}) {
  const t = useTranslations("admin.calendarPage");
  const dateLocale = locale === "en" ? enUS : sq;
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [data, setData] = useState<CalendarDayPayload | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");

  useEffect(() => {
    if (!open || !date) {
      setData(null);
      setSelectedUserId(null);
      setReplyBody("");
      return;
    }

    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const res = await fetch(`/api/admin/calendar/day?date=${encodeURIComponent(date)}`);
        if (!res.ok) throw new Error();
        const payload = (await res.json()) as CalendarDayPayload;
        if (cancelled) return;
        setData(payload);
        const firstMissing = payload.staff.find((s) => !s.report)?.userId;
        const firstSubmitted = payload.staff.find((s) => s.report)?.userId;
        setSelectedUserId(firstMissing ?? firstSubmitted ?? payload.staff[0]?.userId ?? null);
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

  const selected: CalendarStaffDayRow | null = useMemo(() => {
    if (!data || !selectedUserId) return null;
    return data.staff.find((s) => s.userId === selectedUserId) ?? null;
  }, [data, selectedUserId]);

  const dateLabel = date
    ? format(parseCalendarDate(date), "EEEE, d MMMM yyyy", { locale: dateLocale })
    : "";

  async function sendReply() {
    if (!selected?.report || !replyBody.trim()) return;
    setSending(true);
    try {
      const res = await fetch(
        `/api/admin/calendar/reports/${selected.report.id}/replies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: replyBody.trim() }),
        }
      );
      if (!res.ok) throw new Error();
      const reply = await res.json();
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          staff: prev.staff.map((s) =>
            s.userId === selected.userId && s.report
              ? {
                  ...s,
                  report: {
                    ...s.report,
                    replies: [...s.report.replies, reply],
                  },
                }
              : s
          ),
        };
      });
      setReplyBody("");
      toast.success(t("replySent"));
      onReplySent();
    } catch {
      toast.error(t("loadError"));
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] flex-col gap-0 overflow-hidden bg-white p-0 text-slate-900 sm:max-w-3xl dark:bg-white dark:text-slate-900">
        <DialogHeader className="border-b border-border/60 px-5 py-4">
          <DialogTitle>{t("dayReview")}</DialogTitle>
          {dateLabel && (
            <p className="text-sm capitalize text-muted-foreground">{dateLabel}</p>
          )}
          {data && (
            <p className="text-xs font-medium tabular-nums text-muted-foreground">
              {t("submittedCount", {
                submitted: data.submittedCount,
                total: data.staffTotal,
              })}
            </p>
          )}
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">{t("loading")}</div>
        ) : data ? (
          <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
            <div className="max-h-48 shrink-0 overflow-y-auto border-b border-border/60 sm:max-h-none sm:w-60 sm:border-b-0 sm:border-r">
              <ul className="p-2">
                {data.staff.map((member) => {
                  const active = member.userId === selectedUserId;
                  const hasReport = Boolean(member.report);
                  return (
                    <li key={member.userId}>
                      <button
                        type="button"
                        onClick={() => setSelectedUserId(member.userId)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors",
                          active ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-muted/50"
                        )}
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs font-semibold">
                            {staffInitials(member.firstName, member.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {member.firstName} {member.lastName}
                          </p>
                          <Badge
                            variant="outline"
                            className={cn(
                              "mt-0.5 text-[10px]",
                              hasReport
                                ? "border-emerald-200/80 text-emerald-700"
                                : "border-amber-200/80 text-amber-700"
                            )}
                          >
                            {hasReport ? t("submitted") : t("missing")}
                          </Badge>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              {selected ? (
                <>
                  <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs font-semibold">
                          {staffInitials(selected.firstName, selected.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">
                          {selected.firstName} {selected.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{selected.role}</p>
                      </div>
                    </div>

                    {selected.report ? (
                      <div className="space-y-4">
                        <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">
                            {selected.report.body}
                          </p>
                        </div>
                        <ReportReplyThread
                          replies={selected.report.replies}
                          currentUserId={currentUserId}
                          adminFeedbackLabel={t("adminFeedback")}
                        />
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-border/80 bg-muted/10 px-4 py-8 text-center text-sm text-muted-foreground">
                        {t("noReport")}
                      </div>
                    )}
                  </div>

                  {selected.report && (
                    <div className="border-t border-border/60 bg-muted/10 p-4">
                      <Textarea
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        rows={3}
                        placeholder={t("replyPlaceholder")}
                        className="mb-2 resize-none bg-white dark:bg-white"
                      />
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          size="sm"
                          disabled={sending || !replyBody.trim()}
                          onClick={() => void sendReply()}
                        >
                          {sending ? t("sending") : t("sendReply")}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
                  {t("selectStaff")}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
