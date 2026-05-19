import type { ProjectStepStatus } from "./step-types";

export function projectStepStatusLabel(status: ProjectStepStatus, locale: string): string {
  const en = locale === "en";
  switch (status) {
    case "OPEN":
      return en ? "Open" : "Hapur";
    case "IN_PROGRESS":
      return en ? "In progress" : "Në progres";
    case "ON_HOLD":
      return en ? "On hold" : "Në pritje";
    case "CLOSED":
      return en ? "Closed" : "Mbyllur";
    default:
      return status;
  }
}

export function projectStepStatusBadgeClass(status: ProjectStepStatus): string {
  switch (status) {
    case "OPEN":
      return "border-slate-200/80 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300";
    case "IN_PROGRESS":
      return "border-blue-200/80 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300";
    case "ON_HOLD":
      return "border-amber-200/80 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300";
    case "CLOSED":
      return "border-emerald-200/80 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300";
    default:
      return "";
  }
}

export function projectStepStatusRailClass(status: ProjectStepStatus): string {
  switch (status) {
    case "OPEN":
      return "border-l-slate-400";
    case "IN_PROGRESS":
      return "border-l-blue-500";
    case "ON_HOLD":
      return "border-l-amber-500";
    case "CLOSED":
      return "border-l-emerald-500";
    default:
      return "border-l-border";
  }
}
