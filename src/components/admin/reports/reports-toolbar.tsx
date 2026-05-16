"use client";

import { useCallback, useTransition, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  CalendarRange,
  GitCompare,
  RefreshCw,
  Save,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DATE_PRESET_IDS, DEFAULT_REPORT_TZ, type ReportDatePresetId } from "@/lib/reports/date-range";

export function ReportsToolbar({
  locale,
  lp,
  onSavePreset,
  scheduleTrigger,
  onShare,
  onRefresh,
}: {
  locale: string;
  lp: string;
  onSavePreset: () => void;
  scheduleTrigger: React.ReactNode;
  onShare: () => void;
  onRefresh: () => void;
}) {
  const t = useTranslations("admin.reportsPage");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const preset = (searchParams.get("preset") as ReportDatePresetId) || "last30";
  const compare = searchParams.get("compare") === "1";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  const pushParams = useCallback(
    (patch: Record<string, string | null>) => {
      const p = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === "") p.delete(k);
        else p.set(k, v);
      }
      if (!p.has("tz")) p.set("tz", DEFAULT_REPORT_TZ);
      startTransition(() => {
        router.replace(`${lp}/admin/reports?${p.toString()}`);
        onRefresh();
      });
    },
    [searchParams, router, lp, onRefresh]
  );

  return (
    <div
      className={cn(
        "sticky top-14 z-30 -mx-4 mb-6 border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur-md md:-mx-6 md:px-6",
        pending && "opacity-70"
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {DATE_PRESET_IDS.filter((id) => id !== "custom").map((id) => (
            <Button
              key={id}
              type="button"
              size="sm"
              variant={preset === id ? "default" : "outline"}
              className="h-8 rounded-full text-xs"
              onClick={() => pushParams({ preset: id, from: null, to: null })}
            >
              {t(`presets.${id}`)}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CalendarRange className="h-4 w-4 text-muted-foreground" />
          <input
            type="date"
            className="h-8 rounded-lg border bg-background px-2 text-xs"
            value={from}
            onChange={(e) => pushParams({ preset: "custom", from: e.target.value })}
          />
          <span className="text-xs text-muted-foreground">—</span>
          <input
            type="date"
            className="h-8 rounded-lg border bg-background px-2 text-xs"
            value={to}
            onChange={(e) => pushParams({ preset: "custom", to: e.target.value })}
          />
          <Button
            type="button"
            size="sm"
            variant={compare ? "default" : "outline"}
            className="h-8 gap-1 text-xs"
            onClick={() => pushParams({ compare: compare ? null : "1" })}
          >
            <GitCompare className="h-3.5 w-3.5" />
            {t("compare")}
          </Button>
          <Button type="button" size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={onRefresh}>
            <RefreshCw className={cn("h-3.5 w-3.5", pending && "animate-spin")} />
            {t("refresh")}
          </Button>
          <Button type="button" size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={onSavePreset}>
            <Save className="h-3.5 w-3.5" />
            {t("save")}
          </Button>
          {scheduleTrigger}
          <Button type="button" size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={onShare}>
            <Share2 className="h-3.5 w-3.5" />
            {t("share")}
          </Button>
        </div>
      </div>
    </div>
  );
}
