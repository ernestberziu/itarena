import { cn } from "@/lib/utils";
import type { ProjectStepStatus } from "@/lib/projects/step-types";

const STATUS_LABELS: Record<ProjectStepStatus, { sq: string; en: string }> = {
  OPEN: { sq: "Hapur", en: "Open" },
  IN_PROGRESS: { sq: "Në punë", en: "In progress" },
  ON_HOLD: { sq: "Në pritje", en: "On hold" },
  CLOSED: { sq: "Mbyllur", en: "Closed" },
};

const STATUS_COLORS: Record<ProjectStepStatus, string> = {
  OPEN: "border-slate-200 bg-slate-50 text-slate-700",
  IN_PROGRESS: "border-blue-200 bg-blue-50 text-blue-700",
  ON_HOLD: "border-amber-200 bg-amber-50 text-amber-700",
  CLOSED: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function PortalProjectStepsTimeline({
  steps,
  locale,
}: {
  steps: {
    id: string;
    sortOrder: number;
    title: string;
    description: string | null;
    status: string;
  }[];
  locale: string;
}) {
  const lang = locale === "en" ? "en" : "sq";

  if (steps.length === 0) {
    return null;
  }

  return (
    <ol className="relative space-y-4 border-l border-border/70 pl-6">
      {steps.map((step) => {
        const status = step.status as ProjectStepStatus;
        const label = STATUS_LABELS[status]?.[lang] ?? step.status;
        return (
          <li key={step.id} className="relative">
            <span className="absolute -left-[1.65rem] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
            <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold">{step.title}</h3>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    STATUS_COLORS[status] ?? STATUS_COLORS.OPEN
                  )}
                >
                  {label}
                </span>
              </div>
              {step.description ? (
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{step.description}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
