import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Inactive quote status chips — soft tint + crisp border + inner highlight (light).
 */
export const QUOTE_QUICK_FILTER_TONE: Record<string, string> = {
  PENDING:
    "border-amber-400/45 bg-gradient-to-b from-amber-50 to-amber-100/80 text-amber-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] hover:border-amber-500/55 hover:from-amber-50 hover:to-amber-100 dark:border-amber-700/50 dark:from-amber-950/50 dark:to-amber-950/25 dark:text-amber-100 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] dark:hover:border-amber-600/60",
  REVIEWING:
    "border-blue-400/45 bg-gradient-to-b from-blue-50 to-blue-100/80 text-blue-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] hover:border-blue-500/55 hover:from-blue-50 hover:to-blue-100 dark:border-blue-700/50 dark:from-blue-950/45 dark:to-blue-950/20 dark:text-blue-50 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] dark:hover:border-blue-600/60",
  SENT:
    "border-indigo-400/45 bg-gradient-to-b from-indigo-50 to-indigo-100/80 text-indigo-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] hover:border-indigo-500/55 hover:from-indigo-50 hover:to-indigo-100 dark:border-indigo-700/50 dark:from-indigo-950/45 dark:to-indigo-950/20 dark:text-indigo-50 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] dark:hover:border-indigo-600/60",
  ACCEPTED:
    "border-emerald-400/45 bg-gradient-to-b from-emerald-50 to-emerald-100/80 text-emerald-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] hover:border-emerald-500/55 hover:from-emerald-50 hover:to-emerald-100 dark:border-emerald-700/50 dark:from-emerald-950/45 dark:to-emerald-950/20 dark:text-emerald-50 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] dark:hover:border-emerald-600/60",
  REJECTED:
    "border-red-400/45 bg-gradient-to-b from-red-50 to-red-100/80 text-red-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] hover:border-red-500/55 hover:from-red-50 hover:to-red-100 dark:border-red-800/50 dark:from-red-950/45 dark:to-red-950/20 dark:text-red-50 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] dark:hover:border-red-700/60",
  REVISION_REQUESTED:
    "border-purple-400/45 bg-gradient-to-b from-purple-50 to-purple-100/80 text-purple-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] hover:border-purple-500/55 hover:from-purple-50 hover:to-purple-100 dark:border-purple-700/50 dark:from-purple-950/45 dark:to-purple-950/20 dark:text-purple-50 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] dark:hover:border-purple-600/60",
};

export const ORDER_QUICK_FILTER_TONE: Record<string, string> = {
  PLACED:
    "border-amber-400/45 bg-gradient-to-b from-amber-50 to-amber-100/80 text-amber-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] hover:border-amber-500/55 hover:from-amber-50 hover:to-amber-100 dark:border-amber-700/50 dark:from-amber-950/50 dark:to-amber-950/25 dark:text-amber-100 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] dark:hover:border-amber-600/60",
  CONFIRMED:
    "border-blue-400/45 bg-gradient-to-b from-blue-50 to-blue-100/80 text-blue-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] hover:border-blue-500/55 hover:from-blue-50 hover:to-blue-100 dark:border-blue-700/50 dark:from-blue-950/45 dark:to-blue-950/20 dark:text-blue-50 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] dark:hover:border-blue-600/60",
  DISPATCHED:
    "border-indigo-400/45 bg-gradient-to-b from-indigo-50 to-indigo-100/80 text-indigo-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] hover:border-indigo-500/55 hover:from-indigo-50 hover:to-indigo-100 dark:border-indigo-700/50 dark:from-indigo-950/45 dark:to-indigo-950/20 dark:text-indigo-50 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] dark:hover:border-indigo-600/60",
  DELIVERED:
    "border-emerald-400/45 bg-gradient-to-b from-emerald-50 to-emerald-100/80 text-emerald-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] hover:border-emerald-500/55 hover:from-emerald-50 hover:to-emerald-100 dark:border-emerald-700/50 dark:from-emerald-950/45 dark:to-emerald-950/20 dark:text-emerald-50 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] dark:hover:border-emerald-600/60",
  CANCELLED:
    "border-red-400/45 bg-gradient-to-b from-red-50 to-red-100/80 text-red-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] hover:border-red-500/55 hover:from-red-50 hover:to-red-100 dark:border-red-800/50 dark:from-red-950/45 dark:to-red-950/20 dark:text-red-50 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] dark:hover:border-red-700/60",
};

const ALL_INACTIVE =
  "border-slate-400/40 bg-gradient-to-b from-slate-50 to-slate-100/90 text-slate-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7)] hover:border-slate-500/50 hover:from-slate-50 hover:to-slate-100 dark:border-slate-600/55 dark:from-slate-900/70 dark:to-slate-950/90 dark:text-slate-100 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] dark:hover:border-slate-500/60";

const CATALOG_INACTIVE =
  "border-border/80 bg-gradient-to-b from-card to-muted/50 text-foreground/95 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)] hover:border-border hover:to-muted/70 dark:from-card dark:to-muted/25 dark:text-foreground dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] dark:hover:to-muted/40";

/** Selected tab: flat fill, no elevation — selection reads from color + check + weight (avoids shadow inside scroll). */
const ACTIVE_CHIP = [
  "gap-1.5 border border-primary bg-primary px-3.5 text-primary-foreground shadow-none",
  "font-bold tracking-tight",
  "hover:border-primary hover:bg-primary hover:text-primary-foreground",
].join(" ");

export type AdminQuickFilterChip = {
  href: string;
  label: string;
  /** `null` = “All” aggregate */
  value: string | null;
  /** Optional inactive-only classes (active chip uses shared elevated style). */
  inactiveClassName?: string;
};

export function AdminQuickFilterChips({
  title,
  chips,
  activeValue,
  ariaLabel,
}: {
  title?: string;
  chips: AdminQuickFilterChip[];
  /** Resolved selection: `null` when “All” is active. */
  activeValue: string | null;
  ariaLabel: string;
}) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-2.5 lg:max-w-[min(100%,60rem)] xl:max-w-none">
      {title ? (
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/90">
            {title}
          </span>
          <span className="h-px min-w-[2rem] flex-1 bg-gradient-to-r from-border/80 to-transparent" aria-hidden />
        </div>
      ) : null}
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={cn(
          "relative flex max-w-full snap-x snap-mandatory gap-2 overflow-x-auto overflow-y-hidden rounded-[14px] p-1.5",
          "bg-gradient-to-b from-muted/70 via-muted/45 to-muted/25",
          "shadow-[inset_0_1px_0_0_hsl(var(--foreground)/0.04)]",
          "dark:from-muted/40 dark:via-muted/25 dark:to-muted/15",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        {chips.map((c) => {
          const active = c.value === null ? activeValue === null : c.value === activeValue;
          const isAll = c.value === null;
          const inactiveSurface = isAll
            ? ALL_INACTIVE
            : (c.inactiveClassName ?? CATALOG_INACTIVE);

          return (
            <Link
              key={c.value === null ? "all" : c.value}
              href={c.href}
              scroll={false}
              role="tab"
              aria-selected={active}
              className={cn(
                "snap-start shrink-0 select-none rounded-full border px-4 py-2.5 text-center",
                "min-h-10 min-w-[2.75rem] max-w-[min(100vw-2rem,14rem)] sm:max-w-[16rem]",
                "inline-flex items-center justify-center",
                "text-[13px] font-semibold leading-none tracking-tight",
                "transition-[transform,box-shadow,background-color,border-color,color,filter] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active
                  ? ACTIVE_CHIP
                  : cn(
                      "text-muted-foreground shadow-sm",
                      "hover:-translate-y-0.5 hover:text-foreground hover:shadow-md motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-sm",
                      "active:translate-y-0 active:scale-[0.98]",
                      inactiveSurface
                    )
              )}
            >
              {active ? (
                <Check
                  className="pointer-events-none h-3.5 w-3.5 shrink-0 opacity-95"
                  strokeWidth={2.5}
                  aria-hidden
                />
              ) : null}
              <span className={cn("min-w-0 truncate", active ? "flex-1 text-left" : "block")}>{c.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
