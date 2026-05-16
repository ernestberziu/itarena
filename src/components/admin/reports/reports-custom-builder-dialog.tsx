"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DEFAULT_PRESET_CONFIG,
  REPORT_CHART_TYPES,
  REPORT_METRICS,
  type ReportPresetConfig,
} from "@/lib/reports/metric-registry";

export function ReportsCustomBuilderDialog({
  locale,
  triggerLabel,
  initialConfig,
  presetId,
  onSaved,
  open: controlledOpen,
  onOpenChange,
}: {
  locale: string;
  triggerLabel?: string;
  initialConfig?: ReportPresetConfig;
  presetId?: string;
  onSaved?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const en = locale === "en";
  const t = (sq: string, e: string) => (en ? e : sq);
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [name, setName] = useState("");
  const [config, setConfig] = useState<ReportPresetConfig>(initialConfig ?? DEFAULT_PRESET_CONFIG);

  async function save() {
    if (!name.trim() && !presetId) {
      toast.error(t("Vendos një emër", "Enter a name"));
      return;
    }
    try {
      const url = presetId ? `/api/admin/reports/presets/${presetId}` : "/api/admin/reports/presets";
      const res = await fetch(url, {
        method: presetId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || "Report", configJson: config }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(t("U ruajt", "Saved"));
      setOpen(false);
      onSaved?.();
    } catch {
      toast.error(t("Gabim", "Error"));
    }
  }

  function toggleMetric(id: string) {
    setConfig((c) => ({
      ...c,
      metrics: c.metrics.includes(id) ? c.metrics.filter((m) => m !== id) : [...c.metrics, id],
    }));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerLabel ? (
        <DialogTrigger render={<Button variant="outline" size="sm" />}>{triggerLabel}</DialogTrigger>
      ) : null}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("Raport i personalizuar", "Custom report")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("Emri", "Name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label className="mb-2 block">{t("Metrikat", "Metrics")}</Label>
            <div className="grid grid-cols-2 gap-2">
              {REPORT_METRICS.map((m) => (
                <label key={m.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={config.metrics.includes(m.id)}
                    onCheckedChange={() => toggleMetric(m.id)}
                  />
                  {en ? m.labelEn : m.labelSq}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-2 block">{t("Lloji i grafikut", "Chart type")}</Label>
            <select
              className="h-9 w-full rounded-lg border bg-background px-2 text-sm"
              value={config.chartType}
              onChange={(e) =>
                setConfig((c) => ({ ...c, chartType: e.target.value as ReportPresetConfig["chartType"] }))
              }
            >
              {REPORT_CHART_TYPES.map((c) => (
                <option key={c.id} value={c.id}>
                  {en ? c.labelEn : c.labelSq}
                </option>
              ))}
            </select>
          </div>
          <Button type="button" className="w-full" onClick={() => void save()}>
            {t("Ruaj", "Save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

