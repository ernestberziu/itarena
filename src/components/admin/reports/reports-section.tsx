"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ReportsExportMenu } from "./reports-export-menu";
import type { ReportSectionId } from "@/lib/reports/types";

export function ReportsSection({
  id,
  title,
  description,
  locale,
  rangeParams,
  children,
  className,
}: {
  id: ReportSectionId;
  title: string;
  description?: string;
  locale: string;
  rangeParams: Record<string, string>;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={`report-${id}`}
      className={cn(
        "scroll-mt-24 rounded-2xl border border-border/50 p-5 md:p-6",
        "bg-[var(--admin-card-surface,hsl(var(--card)))] shadow-[var(--admin-shadow-sm)]",
        "ring-1 ring-black/[0.03] backdrop-blur-sm dark:ring-white/[0.05]",
        className
      )}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        <ReportsExportMenu section={id} locale={locale} rangeParams={rangeParams} />
      </div>
      {children}
    </section>
  );
}
