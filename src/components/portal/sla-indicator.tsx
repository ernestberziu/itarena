"use client";

import { getSlaStatus } from "@/lib/sla";
import { cn, formatDateTime } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import type { TicketStatus } from "@/types/domain";

function formatHm(totalMs: number): string {
  const abs = Math.abs(totalMs);
  const h = Math.floor(abs / (1000 * 60 * 60));
  const m = Math.floor((abs % (1000 * 60 * 60)) / (1000 * 60));
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function SlaIndicator({
  createdAt,
  deadline,
  status,
  locale = "sq",
}: {
  createdAt: Date;
  deadline: Date;
  status: TicketStatus;
  locale?: string;
}) {
  const slaStatus = getSlaStatus(createdAt, deadline, status);

  const labels = {
    on_track: { sq: "SLA në rregull", en: "SLA on track" },
    at_risk: { sq: "SLA në rrezik", en: "SLA at risk" },
    breached: { sq: "SLA shkelur", en: "SLA breached" },
  };

  /** Resolved / closed: no live SLA state, but keep deadline visible. */
  if (slaStatus === "none") {
    return (
      <span className="inline-flex max-w-full flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
        <span>
          <span className="text-muted-foreground">{locale === "sq" ? "Afati: " : "Due: "}</span>
          <span className="tabular-nums text-foreground/85">{formatDateTime(deadline)}</span>
        </span>
      </span>
    );
  }

  const remaining = deadline.getTime() - Date.now();
  const hoursLeft = Math.max(0, Math.floor(remaining / (1000 * 60 * 60)));
  const minutesLeft = Math.max(
    0,
    Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
  );

  const colorMap = {
    on_track: "text-green-600 dark:text-green-400",
    at_risk: "text-amber-600 dark:text-amber-400",
    breached: "text-red-600 dark:text-red-400",
  };

  const IconMap = {
    on_track: CheckCircle2,
    at_risk: AlertTriangle,
    breached: AlertTriangle,
  };

  const Icon = IconMap[slaStatus];

  const overdueMs = Date.now() - deadline.getTime();

  const dueLine = (
    <span className="block text-[10px] leading-tight text-muted-foreground tabular-nums">
      {locale === "sq" ? "Afati" : "Due"}: {formatDateTime(deadline)}
    </span>
  );

  return (
    <div className={cn("flex max-w-full flex-col gap-1 text-xs shrink-0")}>
      <div className={cn("flex max-w-full flex-wrap items-center gap-x-1.5 gap-y-0.5", colorMap[slaStatus])}>
        <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
        {slaStatus === "breached" ? (
          <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <span>{labels.breached[locale as "sq" | "en"]}</span>
            <span className="tabular-nums font-semibold">+{formatHm(overdueMs)}</span>
          </span>
        ) : (
          <span className="tabular-nums font-medium">
            {hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft}m` : `${minutesLeft}m`}
          </span>
        )}
      </div>
      {dueLine}
    </div>
  );
}
