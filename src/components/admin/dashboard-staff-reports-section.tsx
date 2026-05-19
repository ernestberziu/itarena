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
  const t = (sq: string, e: string) => (en ? e : sq);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3 flex flex-row items-start justify-between gap-3 border-b">
        <div>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
            {title}
          </CardTitle>
          <p className="mt-1 text-xs tabular-nums text-muted-foreground">
            {t("Dorëzuar", "Submitted")}: {payload.submittedCount}/{payload.staffTotal}
          </p>
        </div>
        <Link
          href={`${lp}/admin/calendar`}
          className="shrink-0 text-xs font-medium text-primary hover:underline"
        >
          {t("Kalendari →", "Calendar →")}
        </Link>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        {isAdmin ? (
          payload.staff.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("Nuk ka staf aktiv", "No active staff")}
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
                            {t("Dorëzuar", "Submitted")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            {t("Mungon", "Missing")}
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
                        {t("Nuk ka raport", "No report submitted")}
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
              {t("Raporti juaj", "Your report")}
            </Badge>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{payload.ownReport.body}</p>
          </div>
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              {t("Nuk keni dorëzuar raportin për këtë ditë", "You have not submitted a report for this day")}
            </p>
            <Link
              href={`${lp}/admin/calendar`}
              className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
            >
              {t("Shkruaj raportin →", "Write report →")}
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
        title={en ? "Today's staff reports" : "Raportet e stafit — sot"}
        payload={today}
        locale={locale}
        lp={lp}
        isAdmin={isAdmin}
      />
      <StaffReportsCard
        title={en ? "Yesterday's staff reports" : "Raportet e stafit — dje"}
        payload={yesterday}
        locale={locale}
        lp={lp}
        isAdmin={isAdmin}
      />
    </div>
  );
}
