"use client";
import { useUiT } from "@/hooks/use-ui-t";

import { useEffect, useState } from "react";
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

type PresetRow = { id: string; name: string };

export function ReportsScheduleDialog({
  locale,
  triggerLabel,
}: {
  locale: string;
  triggerLabel: string;
}) {
  const en = locale === "en";
  const tUi = useUiT();
  const [open, setOpen] = useState(false);
  const [presets, setPresets] = useState<PresetRow[]>([]);
  const [presetId, setPresetId] = useState("");
  const [cron, setCron] = useState("0 8 * * 1");
  const [recipients, setRecipients] = useState("");

  useEffect(() => {
    if (!open) return;
    void fetch("/api/admin/reports/presets")
      .then((r) => r.json())
      .then((rows: PresetRow[]) => {
        setPresets(rows);
        if (rows[0]) setPresetId(rows[0].id);
      })
      .catch(() => {});
  }, [open]);

  async function submit() {
    const emails = recipients
      .split(/[,;\s]+/)
      .map((e) => e.trim())
      .filter(Boolean);
    if (!presetId || emails.length === 0) {
      toast.error(tUi("choose_preset_and_emails"));
      return;
    }
    try {
      const res = await fetch("/api/admin/reports/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presetId, cron, recipients: emails }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(tUi("schedule_created"));
      setOpen(false);
    } catch {
      toast.error(tUi("error"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" size="sm" variant="outline" className="h-8 gap-1 text-xs" />}>
        {triggerLabel}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tUi("schedule_report")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{tUi("preset")}</Label>
            <select
              className="h-9 w-full rounded-lg border bg-background px-2 text-sm"
              value={presetId}
              onChange={(e) => setPresetId(e.target.value)}
            >
              {presets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Cron</Label>
            <Input value={cron} onChange={(e) => setCron(e.target.value)} placeholder="0 8 * * 1" />
          </div>
          <div className="space-y-2">
            <Label>{tUi("recipients")}</Label>
            <Input
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="ops@example.com"
            />
          </div>
          <Button type="button" className="w-full" onClick={() => void submit()}>
            {tUi("create")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
