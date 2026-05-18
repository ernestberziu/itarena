"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProjectModeTab<T extends string> = {
  id: T;
  label: string;
  icon?: LucideIcon;
};

export function ProjectModeTabs<T extends string>({
  value,
  onChange,
  options,
  className,
  layout = "auto",
}: {
  value: T;
  onChange: (value: T) => void;
  options: ProjectModeTab<T>[];
  className?: string;
  /** `row` — horizontal strip (e.g. company / contact). */
  layout?: "auto" | "row";
}) {
  return (
    <div
      className={cn(
        "flex gap-1 rounded-xl border border-border/60 bg-muted/40 p-1 shadow-inner ring-1 ring-inset ring-black/[0.04] dark:ring-white/[0.06]",
        layout === "row" ? "flex-row" : "flex-col sm:flex-row",
        className
      )}
      role="tablist"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(opt.id)}
            className={cn(
              "inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              selected
                ? "bg-white text-foreground shadow-sm ring-1 ring-border/60 dark:bg-white"
                : "text-muted-foreground hover:bg-white/70 hover:text-foreground"
            )}
          >
            {Icon ? <Icon className="h-4 w-4 shrink-0 opacity-80" strokeWidth={2} aria-hidden /> : null}
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
