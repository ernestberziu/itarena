import { cn } from "@/lib/utils";

interface FilterBarProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Shell for URL-driven GET filters (search, segmented chips).
 * Slightly elevated surface so filters read as one control deck.
 */
export function FilterBar({ children, className }: FilterBarProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 bg-gradient-to-b from-muted/35 via-muted/20 to-muted/30",
        "p-4 shadow-sm ring-1 ring-black/[0.03] dark:from-muted/20 dark:via-muted/15 dark:to-muted/25 dark:ring-white/[0.05]",
        className
      )}
    >
      {children}
    </div>
  );
}
