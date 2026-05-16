"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReportsOverviewPayload } from "@/lib/reports/types";

export function ReportsInsightsPanel({
  insights,
  locale,
}: {
  insights: ReportsOverviewPayload["insights"];
  locale: string;
}) {
  const en = locale === "en";
  if (insights.length === 0) return null;

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 ring-1 ring-primary/10">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Sparkles className="h-4 w-4 text-primary" />
        {en ? "Insights" : "Vëzhgime"}
      </div>
      <ul className="space-y-2">
        {insights.map((item, i) => (
          <li
            key={i}
            className={cn(
              "text-sm leading-snug",
              item.tone === "positive" && "text-emerald-700 dark:text-emerald-400",
              item.tone === "negative" && "text-red-700 dark:text-red-400",
              item.tone === "neutral" && "text-muted-foreground"
            )}
          >
            {en ? item.textEn : item.textSq}
          </li>
        ))}
      </ul>
    </div>
  );
}
