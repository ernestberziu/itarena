"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { buildCalendarPrintHtml, printCalendarHtml } from "@/lib/calendar/print-html";
import type { CalendarPrintPayload } from "@/lib/calendar/types";

type StaffOption = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
};

export function CalendarPrintDialog({
  locale,
  year,
  month,
}: {
  locale: string;
  year: number;
  month: number;
}) {
  const t = useTranslations("admin.calendarPage");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [allStaff, setAllStaff] = useState(true);
  const [staff, setStaff] = useState<StaffOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const res = await fetch("/api/admin/calendar/roster");
        if (!res.ok) throw new Error();
        const data = (await res.json()) as StaffOption[];
        if (cancelled) return;
        setStaff(data);
        setSelectedIds(new Set(data.map((s) => s.id)));
      } catch {
        if (!cancelled) toast.error(t("loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, t]);

  const allSelected = useMemo(
    () => staff.length > 0 && staff.every((s) => selectedIds.has(s.id)),
    [staff, selectedIds]
  );

  function toggleStaff(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setAllStaff(false);
  }

  function toggleAll(checked: boolean) {
    setAllStaff(checked);
    if (checked) setSelectedIds(new Set(staff.map((s) => s.id)));
    else setSelectedIds(new Set());
  }

  async function handlePrint() {
    if (!allStaff && selectedIds.size === 0) {
      toast.error(t("printSelectStaff"));
      return;
    }
    setPrinting(true);
    try {
      const params = new URLSearchParams({
        year: String(year),
        month: String(month),
      });
      if (!allStaff && selectedIds.size > 0) {
        params.set("userIds", [...selectedIds].join(","));
      }
      const res = await fetch(`/api/admin/calendar/print?${params.toString()}`);
      if (!res.ok) throw new Error();
      const payload = (await res.json()) as CalendarPrintPayload;
      const html = buildCalendarPrintHtml(payload, locale, {
        title: t("printTitle"),
        noReport: t("noReport"),
        adminFeedback: t("adminFeedback"),
        dayHeader: t("printDays"),
      });
      const ok = printCalendarHtml(html);
      if (!ok) toast.error(t("loadError"));
      else setOpen(false);
    } catch {
      toast.error(t("loadError"));
    } finally {
      setPrinting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" variant="outline" size="sm" className="gap-1.5">
            <Printer className="h-3.5 w-3.5" />
            {t("printReports")}
          </Button>
        }
      />
      <DialogContent className="max-h-[min(90vh,640px)] overflow-y-auto bg-white text-slate-900 sm:max-w-md dark:bg-white dark:text-slate-900">
        <DialogHeader>
          <DialogTitle>{t("printReports")}</DialogTitle>
          <p className="text-sm text-muted-foreground">{t("printReportsHint")}</p>
        </DialogHeader>

        {loading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t("loading")}</p>
        ) : (
          <div className="space-y-4">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 bg-muted/10 p-3">
              <Checkbox
                checked={allStaff}
                onCheckedChange={(v) => toggleAll(v === true)}
              />
              <div>
                <p className="text-sm font-medium">{t("printAllStaff")}</p>
                <p className="text-xs text-muted-foreground">{t("printAllStaffHint")}</p>
              </div>
            </label>

            {!allStaff && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t("printSelectStaff")}</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => toggleAll(!allSelected)}
                  >
                    {allSelected ? t("printDeselectAll") : t("printSelectAll")}
                  </Button>
                </div>
                <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-border/60 p-2">
                  {staff.map((member) => (
                    <label
                      key={member.id}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted/40"
                    >
                      <Checkbox
                        checked={selectedIds.has(member.id)}
                        onCheckedChange={() => toggleStaff(member.id)}
                      />
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {member.firstName} {member.lastName}
                      </span>
                      <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
                        {member.role}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="sm:justify-end">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            {t("cancel")}
          </Button>
          <Button
            type="button"
            className="gap-1.5"
            disabled={printing || loading || (!allStaff && selectedIds.size === 0)}
            onClick={() => void handlePrint()}
          >
            <Printer className="h-3.5 w-3.5" />
            {printing ? t("printing") : t("print")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
