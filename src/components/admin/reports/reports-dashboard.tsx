"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import type { ReportsOverviewPayload } from "@/lib/reports/types";
import { ReportsToolbar } from "./reports-toolbar";
import { ReportsKpiCard } from "./reports-kpi-card";
import { ReportsInsightsPanel } from "./reports-insights-panel";
import { ReportsSections } from "./reports-sections";
import { ReportsCustomBuilderDialog } from "./reports-custom-builder-dialog";
import { ReportsExportMenu } from "./reports-export-menu";

export function ReportsDashboard({ locale, lp }: { locale: string; lp: string }) {
  const t = useTranslations("admin.reportsPage");
  const searchParams = useSearchParams();
  const [data, setData] = useState<ReportsOverviewPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    for (const key of ["preset", "from", "to", "tz"]) {
      const v = searchParams.get(key);
      if (v) p.set(key, v);
    }
    if (!p.has("tz")) p.set("tz", "Europe/Tirane");
    return p.toString();
  }, [searchParams]);

  const rangeParams = useMemo(() => {
    const o: Record<string, string> = {};
    for (const key of ["from", "to", "tz"]) {
      const v = searchParams.get(key);
      if (v) o[key] = v;
    }
    const preset = searchParams.get("preset");
    if (preset) o.preset = preset;
    return o;
  }, [searchParams]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reports/overview?${queryString}`);
      if (!res.ok) throw new Error("Failed");
      const json = (await res.json()) as ReportsOverviewPayload;
      setData(json);
    } catch {
      setError(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [queryString, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const rangeLabel =
    data?.range.from && data?.range.to
      ? `${format(new Date(data.range.from), "PP")} — ${format(new Date(data.range.to), "PP")}`
      : "";

  return (
    <div className="reports-dashboard print:bg-white">
      <AdminPageHeader
        title={t("title")}
        description={rangeLabel || t("description")}
        actions={
          <div className="flex flex-wrap gap-2">
            <ReportsExportMenu section="overview" locale={locale} rangeParams={rangeParams} />
            <ReportsCustomBuilderDialog
              locale={locale}
              onSaved={() => load()}
              triggerLabel={t("customReport")}
            />
          </div>
        }
      />

      <ReportsToolbar lp={lp} onRefresh={() => void load()} />

      {loading && !data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/40" />
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</p>
      ) : null}

      {data ? (
        <>
          <ReportsInsightsPanel insights={data.insights} locale={locale} />
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {data.kpis.map((kpi) => (
              <ReportsKpiCard key={kpi.key} kpi={kpi} locale={locale} />
            ))}
          </div>
          <div className="mt-8">
            <ReportsSections data={data} locale={locale} rangeParams={rangeParams} />
          </div>
        </>
      ) : null}
    </div>
  );
}
