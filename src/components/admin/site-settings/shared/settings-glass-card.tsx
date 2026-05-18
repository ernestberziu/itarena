"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function SettingsGlassCard({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-[var(--admin-card-surface,hsl(var(--card)))] p-5 shadow-sm",
        className
      )}
    >
      {(title || description) && (
        <CardHeader title={title} description={description} />
      )}
      {children}
    </div>
  );
}

function CardHeader({ title, description }: { title?: string; description?: string }) {
  if (!title && !description) return null;
  return (
    <div className="mb-4">
      {title ? <h3 className="text-sm font-semibold text-foreground">{title}</h3> : null}
      {description ? (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
