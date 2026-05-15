"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminTicketsFilterDeck({
  title,
  hint,
  clearAll,
  children,
  defaultOpen = false,
}: {
  title: string;
  hint: string;
  clearAll: ReactNode;
  children: ReactNode;
  /** Collapsed by default so the list stays primary. */
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/60 bg-card shadow-md ring-1 ring-black/[0.04] dark:bg-card/90 dark:ring-white/[0.06]"
      )}
    >
      <div className="flex flex-col gap-2 border-b border-border/60 bg-muted/30 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-5 sm:py-3.5">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-start gap-2 rounded-md text-left outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <ChevronDown
            className={cn(
              "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-180"
            )}
            strokeWidth={2}
            aria-hidden
          />
          <span className="min-w-0 space-y-0.5">
            <span className="block text-sm font-semibold tracking-tight text-foreground">{title}</span>
            <span className="block text-xs leading-snug text-muted-foreground">{hint}</span>
          </span>
        </button>
        {clearAll ? <div className="shrink-0 pl-6 sm:pl-0">{clearAll}</div> : null}
      </div>
      {open ? <div className="space-y-5 p-4 sm:p-5">{children}</div> : null}
    </div>
  );
}
