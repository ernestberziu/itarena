"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export function TemplateOptionToggle({
  id,
  checked,
  onCheckedChange,
  title,
  description,
  icon: Icon,
  children,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border transition-all duration-200",
        checked
          ? "border-primary/35 bg-primary/[0.06] shadow-sm ring-1 ring-primary/15"
          : "border-border/60 bg-muted/10 hover:border-border hover:bg-muted/20"
      )}
    >
      <label
        htmlFor={id}
        className="flex cursor-pointer items-start gap-3 p-4"
      >
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(v === true)}
          className="mt-0.5 size-5 rounded-md border-2 data-checked:border-primary data-checked:bg-primary"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {Icon ? (
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  checked ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
              </span>
            ) : null}
            <span className="text-sm font-semibold leading-snug">{title}</span>
          </div>
          {description ? (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </label>
      {checked && children ? (
        <div className="space-y-4 border-t border-border/50 bg-background/50 px-4 pb-4 pt-4">
          {children}
        </div>
      ) : null}
    </div>
  );
}
