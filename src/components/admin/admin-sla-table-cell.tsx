"use client";

import { getSlaElapsedPercent, getSlaStatus, isSlaBreached } from "@/lib/sla";
import { cn, formatDateTime } from "@/lib/utils";
import type { TicketStatus } from "@/types/domain";

function formatHm(totalMs: number): string {
  const abs = Math.abs(totalMs);
  const h = Math.floor(abs / (1000 * 60 * 60));
  const m = Math.floor((abs % (1000 * 60 * 60)) / (1000 * 60));
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

type SlaVisual = "met" | "on_track" | "at_risk" | "breached";

const PILL: Record<
  SlaVisual,
  { sq: string; en: string; className: string; barClassName: string }
> = {
  met: {
    sq: "Në kohë",
    en: "Met",
    className:
      "border-emerald-200/80 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300",
    barClassName: "bg-emerald-500",
  },
  on_track: {
    sq: "Në rregull",
    en: "On track",
    className:
      "border-emerald-200/70 bg-emerald-50/80 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300",
    barClassName: "bg-emerald-500",
  },
  at_risk: {
    sq: "Në rrezik",
    en: "At risk",
    className:
      "border-amber-200/80 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200",
    barClassName: "bg-amber-500",
  },
  breached: {
    sq: "Shkelur",
    en: "Breached",
    className:
      "border-rose-200/80 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300",
    barClassName: "bg-rose-500",
  },
};

export function AdminSlaTableCell({
  createdAt,
  deadline,
  status,
  resolvedAt,
  locale = "sq",
}: {
  createdAt: Date;
  deadline: Date;
  status: TicketStatus;
  resolvedAt?: Date | null;
  locale?: string;
}) {
  const lang = locale === "en" ? "en" : "sq";
  const terminal = ["RESOLVED", "CLOSED"].includes(status);
  const breached = isSlaBreached({ slaDeadline: deadline, status, resolvedAt });
  const slaStatus = getSlaStatus(createdAt, deadline, status, resolvedAt);

  const visual: SlaVisual = terminal
    ? breached
      ? "breached"
      : "met"
    : slaStatus === "breached"
      ? "breached"
      : slaStatus === "at_risk"
        ? "at_risk"
        : "on_track";

  const pill = PILL[visual];
  const referenceMs = terminal && resolvedAt ? resolvedAt.getTime() : Date.now();
  const remainingMs = deadline.getTime() - referenceMs;
  const overdueMs = referenceMs - deadline.getTime();

  let timingLine: string | null = null;
  if (terminal) {
    if (breached && overdueMs > 0) {
      timingLine =
        lang === "sq" ? `+${formatHm(overdueMs)} vonë` : `+${formatHm(overdueMs)} late`;
    }
  } else if (breached && overdueMs > 0) {
    timingLine = lang === "sq" ? `+${formatHm(overdueMs)} vonë` : `+${formatHm(overdueMs)} overdue`;
  } else if (remainingMs > 0) {
    timingLine =
      lang === "sq" ? `${formatHm(remainingMs)} mbetur` : `${formatHm(remainingMs)} left`;
  }

  const elapsed =
    !terminal && slaStatus !== "none"
      ? getSlaElapsedPercent(createdAt, deadline)
      : null;

  return (
    <div className="flex min-w-[7.5rem] max-w-[10rem] flex-col gap-1.5">
      <span
        className={cn(
          "inline-flex w-fit items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
          pill.className
        )}
      >
        {pill[lang]}
      </span>

      {timingLine ? (
        <p
          className={cn(
            "text-xs font-semibold tabular-nums leading-none",
            visual === "breached" ? "text-rose-600 dark:text-rose-400" : "text-foreground/90"
          )}
        >
          {timingLine}
        </p>
      ) : null}

      <p className="text-[11px] leading-tight text-muted-foreground tabular-nums">
        <span className="text-muted-foreground/80">{lang === "sq" ? "Afati " : "Due "}</span>
        {formatDateTime(deadline)}
      </p>

      {elapsed != null ? (
        <div className="h-1 w-full overflow-hidden rounded-full bg-muted/80" aria-hidden>
          <div
            className={cn("h-full rounded-full transition-[width]", pill.barClassName)}
            style={{ width: `${Math.min(100, elapsed)}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
