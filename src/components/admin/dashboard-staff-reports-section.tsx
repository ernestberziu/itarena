"use client";

import { useUiT } from "@/hooks/use-ui-t";
import Link from "next/link";
import { CalendarDays, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CalendarDayPayload } from "@/lib/calendar/types";

function previewBody(body: string, max = 140) {
  const t = body.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

function StaffReportsCard({
  title,
  payload,
  locale,
  lp,
  isAdmin,
}: {
  title: string;
  payload: CalendarDayPayload;
  locale: string;
  lp: string;
  isAdmin: boolean;
}) {
  const en = locale === "en";
  const tUi = useUiT();

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3 flex flex-row items-start justify-between gap-3 border-b">
        <div>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
            {title}
          </CardTitle>
          <p className="mt-1 text-xs tabular-nums text-muted-foreground">
            {isAdmin
              ? tUi("submitted") + `: ${payload.submittedCount}/${payload.staffTotal}`
              : payload.ownReport
                ? tUi("submitted")
                : tUi("not_submitted")}
          </p>
        </div>
        <Link
          href={`${lp}/admin/calendar`}
          className="shrink-0 text-xs font-medium text-primary hover:underline"
        >
          {tUi("calendar")}
        </Link>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        {isAdmin ? (
          payload.staff.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {tUi("no_active_staff")}
            </p>
          ) : (
            <div className="divide-y max-h-[320px] overflow-y-auto">
              {payload.staff.map((member) => {
                const hasReport = Boolean(member.report);
                return (
                  <div key={member.userId} className="px-4 py-3 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">
                        {member.firstName} {member.lastName}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "shrink-0 text-[10px]",
                          hasReport
                            ? "border-emerald-200/80 text-emerald-700"
                            : "border-amber-200/80 text-amber-700"
                        )}
                      >
                        {hasReport ? (
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {tUi("submitted")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            {tUi("missing")}
                          </span>
                        )}
                      </Badge>
                    </div>
                    {member.report ? (
                      <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                        {previewBody(member.report.body)}
                      </p>
                    ) : (
                      <p className="text-xs italic text-muted-foreground">
                        {tUi("no_report_submitted")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : payload.ownReport ? (
          <div className="px-4 py-4">
            <Badge variant="outline" className="mb-2 border-emerald-200/80 text-emerald-700 text-[10px]">
              {tUi("your_report")}
            </Badge>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{payload.ownReport.body}</p>
          </div>
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              {tUi("you_have_not_submitted_a_report_for_this_day")}
            </p>
            <Link
              href={`${lp}/admin/calendar`}
              className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
            >
              {tUi("write_report")}
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardStaffReportsSection({
  locale,
  lp,
  isAdmin,
  today,
  yesterday,
}: {
  locale: string;
  lp: string;
  isAdmin: boolean;
  today: CalendarDayPayload;
  yesterday: CalendarDayPayload;
}) {
  const en = locale === "en";

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <StaffReportsCard
        title={isAdmin ? (en ? "Today's staff reports" : "Raportet e stafit — sot") : en ? "My report — today" : "Raporti im — sot"}
        payload={today}
        locale={locale}
        lp={lp}
        isAdmin={isAdmin}
      />
      <StaffReportsCard
        title={isAdmin ? (en ? "Yesterday's staff reports" : "Raportet e stafit — dje") : en ? "My report — yesterday" : "Raporti im — dje"}
        payload={yesterday}
        locale={locale}
        lp={lp}
        isAdmin={isAdmin}
      />
    </div>
  );
}
