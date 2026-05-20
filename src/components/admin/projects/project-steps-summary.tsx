"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  PROJECT_STEP_STATUSES,
  type ProjectStepRow,
  type ProjectStepStatus,
} from "@/lib/projects/step-types";
import {
  projectStepStatusBadgeClass,
  projectStepStatusLabel,
} from "@/lib/projects/step-status-ui";

export function ProjectStepsSummary({
  steps,
  locale,
}: {
  steps: ProjectStepRow[];
  locale: string;
}) {
  const t = useTranslations("admin.projectsPage");

  const counts = useMemo(() => {
    const map: Record<ProjectStepStatus, number> = {
      OPEN: 0,
      IN_PROGRESS: 0,
      ON_HOLD: 0,
      CLOSED: 0,
    };
    for (const s of steps) {
      map[s.status] = (map[s.status] ?? 0) + 1;
    }
    return map;
  }, [steps]);

  const closed = counts.CLOSED;
  const total = steps.length;
  const pct = total > 0 ? Math.round((closed / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-to-b from-card to-muted/15 p-4 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05] md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("stepsRoadmapEyebrow")}
          </p>
          <p className="text-sm font-semibold text-foreground">
            {t("stepsProgress", { closed, total })}
          </p>
        </div>
        <p className="admin-stat-value text-lg font-bold tabular-nums leading-snug text-foreground">{pct}%</p>
      </div>

      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-emerald-500 transition-[width] duration-300 ease-out motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {PROJECT_STEP_STATUSES.map((status) => {
          const n = counts[status];
          if (n === 0) return null;
          return (
            <span
              key={status}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tabular-nums",
                projectStepStatusBadgeClass(status)
              )}
            >
              {projectStepStatusLabel(status, locale)}
              <span className="opacity-80">{n}</span>
            </span>
          );
        })}
        {total === 0 && (
          <span className="text-xs text-muted-foreground">{t("noSteps")}</span>
        )}
      </div>
    </div>
  );
}
