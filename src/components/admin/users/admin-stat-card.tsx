import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared typography for KPI / stat values across admin dashboards. */
export const adminStatValueClassName =
  "admin-stat-value text-lg font-semibold tabular-nums tracking-tight leading-snug text-foreground";

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card to-muted/20 p-4 shadow-sm ring-1 ring-black/[0.03] dark:from-card dark:to-muted/10 dark:ring-white/[0.06]",
        "transition-shadow duration-200 hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className={adminStatValueClassName}>{value}</p>
        </div>
        {Icon ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/80 text-muted-foreground shadow-inner">
            <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
          </span>
        ) : null}
      </div>
    </div>
  );
}
