import Link from "next/link";
import { cn } from "@/lib/utils";

/** Track behind URL-driven filter pills (segmented control look). */
export function SegmentedFilterTrack({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-muted/45 p-1 shadow-inner",
        "ring-1 ring-inset ring-black/[0.04] dark:bg-muted/25 dark:ring-white/[0.06]"
      )}
    >
      <div className="flex flex-wrap gap-0.5" role="list">
        {children}
      </div>
    </div>
  );
}

export function SegmentedFilterLink({
  href,
  label,
  selected,
}: {
  href: string;
  label: string;
  selected: boolean;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      role="listitem"
      aria-current={selected ? "page" : undefined}
      className={cn(
        "inline-flex min-h-9 min-w-[2.25rem] shrink-0 items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium tabular-nums",
        "transition-all duration-150 ease-out outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        selected
          ? "bg-background text-foreground shadow-sm ring-1 ring-border/60 dark:bg-card dark:ring-border/80"
          : "text-muted-foreground hover:bg-background/75 hover:text-foreground active:scale-[0.98]"
      )}
    >
      {label}
    </Link>
  );
}
