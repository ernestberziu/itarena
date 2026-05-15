import type { Priority } from "@/types/domain";
import { cn } from "@/lib/utils";

const priorityStyles: Record<Priority, string> = {
  LOW: "bg-muted text-muted-foreground border-border dark:bg-muted/50 dark:border-border/80",
  MEDIUM:
    "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/45 dark:text-sky-100 dark:border-sky-800/50",
  HIGH:
    "bg-orange-50 text-orange-900 border-orange-200 dark:bg-orange-950/40 dark:text-orange-100 dark:border-orange-800/50",
  CRITICAL:
    "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/45 dark:text-red-100 dark:border-red-800/50",
};

const priorityLabels: Record<Priority, { sq: string; en: string }> = {
  LOW: { sq: "E Ulët", en: "Low" },
  MEDIUM: { sq: "Mesatare", en: "Medium" },
  HIGH: { sq: "E Lartë", en: "High" },
  CRITICAL: { sq: "Kritike", en: "Critical" },
};

export function PriorityBadge({
  priority,
  locale = "sq",
  className,
}: {
  priority: Priority;
  locale?: string;
  className?: string;
}) {
  const label = priorityLabels[priority]?.[locale as "sq" | "en"] ?? priority;
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-center text-xs font-medium",
        priorityStyles[priority],
        className
      )}
    >
      {label}
    </span>
  );
}
