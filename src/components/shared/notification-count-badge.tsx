import { cn } from "@/lib/utils";

function formatCount(count: number): string {
  if (count > 99) return "99+";
  if (count > 9) return "9+";
  return String(count);
}

/** Shared count pill — amber accent + dark text (no white fill). */
const countPillClass =
  "inline-flex shrink-0 items-center justify-center rounded-full border border-amber-600/40 bg-accent font-semibold tabular-nums leading-none text-foreground shadow-[0_1px_2px_hsl(222_47%_8%/0.12)]";

/** Overlay on header bell icon. */
export function NotificationBellBadge({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        countPillClass,
        "pointer-events-none absolute -right-1 -top-1 z-10 h-[17px] min-w-[17px] px-1 text-[10px] ring-2 ring-background",
        className
      )}
      aria-hidden
    >
      {formatCount(count)}
    </span>
  );
}

/** Inline count in expanded sidebar nav row. */
export function NotificationNavBadge({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  if (count <= 0) return null;

  return (
    <span className={cn(countPillClass, "h-5 min-w-5 px-1.5 text-[10px]", className)} aria-hidden>
      {formatCount(count)}
    </span>
  );
}

/** Dot when sidebar is collapsed. */
export function NotificationCollapsedDot({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-amber-600/50 bg-accent ring-2 ring-background",
        className
      )}
      aria-hidden
    />
  );
}
