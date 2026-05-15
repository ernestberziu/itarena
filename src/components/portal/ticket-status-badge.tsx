import type { TicketStatus } from "@/types/domain";
import { cn } from "@/lib/utils";

const statusStyles: Record<TicketStatus, string> = {
  OPEN:
    "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-100 dark:border-blue-800/60",
  ASSIGNED:
    "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/45 dark:text-purple-100 dark:border-purple-800/50",
  IN_PROGRESS:
    "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-100 dark:border-amber-800/50",
  PAUSED:
    "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900/50 dark:text-slate-100 dark:border-slate-600/60",
  PENDING_CLIENT:
    "bg-orange-50 text-orange-900 border-orange-200 dark:bg-orange-950/40 dark:text-orange-100 dark:border-orange-800/50",
  RESOLVED:
    "bg-green-50 text-green-800 border-green-200 dark:bg-green-950/45 dark:text-green-100 dark:border-green-800/50",
  CLOSED:
    "bg-muted text-muted-foreground border-border dark:bg-muted/40 dark:text-muted-foreground dark:border-border/80",
};

const statusLabels: Record<TicketStatus, { sq: string; en: string }> = {
  OPEN: { sq: "Hapur", en: "Open" },
  ASSIGNED: { sq: "Caktuar", en: "Assigned" },
  IN_PROGRESS: { sq: "Në Progres", en: "In Progress" },
  PAUSED: { sq: "Në pauzë", en: "Paused" },
  PENDING_CLIENT: { sq: "Pret Klientin", en: "Pending Client" },
  RESOLVED: { sq: "Zgjidhur", en: "Resolved" },
  CLOSED: { sq: "Mbyllur", en: "Closed" },
};

export function TicketStatusBadge({
  status,
  locale = "sq",
  className,
}: {
  status: TicketStatus;
  locale?: string;
  className?: string;
}) {
  const label = statusLabels[status]?.[locale as "sq" | "en"] ?? status;
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-center text-xs font-medium",
        statusStyles[status],
        className
      )}
    >
      {label}
    </span>
  );
}
