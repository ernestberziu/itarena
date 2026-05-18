import type { ProjectStatus } from "./types";

export function projectStatusLabel(status: ProjectStatus, locale: string): string {
  const en = locale === "en";
  switch (status) {
    case "ACTIVE":
      return en ? "Active" : "Aktiv";
    case "COMPLETED":
      return en ? "Completed" : "Përfunduar";
    case "ARCHIVED":
      return en ? "Archived" : "Arkivuar";
    default:
      return status;
  }
}

export function projectStatusBadgeClass(status: ProjectStatus): string {
  switch (status) {
    case "ACTIVE":
      return "border-emerald-200/80 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "COMPLETED":
      return "border-blue-200/80 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300";
    case "ARCHIVED":
      return "border-border/80 bg-muted/60 text-muted-foreground";
    default:
      return "";
  }
}
