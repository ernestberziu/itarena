"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Priority } from "@/types/domain";
import { MAX_RESOLUTION_HOURS, WORKING_HOURS_PER_DAY } from "@/lib/ticket-estimate";

export type EngineerOption = { id: string; firstName: string; lastName: string };

function inputsFromEstimate(days: number | null, hours: number | null) {
  return {
    days: days != null && days > 0 ? String(days) : "",
    hours: hours != null && hours > 0 ? String(hours) : "",
  };
}

export function AdminTicketOpsForm({
  ticketId,
  locale,
  engineers,
  assignedToId,
  priority,
  estimatedDays,
  estimatedHours,
  onSaved,
  className,
}: {
  ticketId: string;
  locale: string;
  engineers: EngineerOption[];
  assignedToId: string | null;
  priority: Priority;
  estimatedDays: number | null;
  estimatedHours: number | null;
  onSaved?: () => void;
  className?: string;
}) {
  const router = useRouter();
  const t = (sq: string, en: string) => (locale === "sq" ? sq : en);
  const [loading, setLoading] = useState(false);
  const [assignee, setAssignee] = useState<string | null>(assignedToId);
  const [pri, setPri] = useState<Priority>(priority);
  const init = inputsFromEstimate(estimatedDays, estimatedHours);
  const [daysInput, setDaysInput] = useState(init.days);
  const [hoursInput, setHoursInput] = useState(init.hours);

  useEffect(() => {
    const next = inputsFromEstimate(estimatedDays, estimatedHours);
    setDaysInput(next.days);
    setHoursInput(next.hours);
    setAssignee(assignedToId);
    setPri(priority);
  }, [estimatedDays, estimatedHours, assignedToId, priority]);

  const priorityLabels: Record<Priority, { sq: string; en: string }> = {
    LOW: { sq: "E Ulët", en: "Low" },
    MEDIUM: { sq: "Mesatare", en: "Medium" },
    HIGH: { sq: "E Lartë", en: "High" },
    CRITICAL: { sq: "Kritike", en: "Critical" },
  };

  const selectedEngineer = assignee ? engineers.find((e) => e.id === assignee) : undefined;
  const assigneeUnassignedLabel = t("I pacaktuar", "Unassigned");
  const assigneeTriggerLabel = selectedEngineer
    ? `${selectedEngineer.firstName} ${selectedEngineer.lastName}`.trim()
    : assigneeUnassignedLabel;
  const priorityTriggerLabel =
    priorityLabels[pri]?.[locale === "sq" ? "sq" : "en"] ?? pri;

  async function save() {
    let estimatedDaysOut: number | undefined;
    let estimatedHoursOut: number | undefined;
    const rawDays = daysInput.trim();
    const rawHours = hoursInput.trim();

    if (rawDays.length > 0) {
      const nd = Number.parseInt(rawDays, 10);
      if (Number.isNaN(nd) || nd < 0 || nd > 62) {
        toast.error(
          t("Ditët e vlerësuara: 0–62", "Estimated days must be a whole number from 0 to 62")
        );
        return;
      }
      estimatedDaysOut = nd;
    }
    if (rawHours.length > 0) {
      const nh = Number.parseInt(rawHours, 10);
      if (Number.isNaN(nh) || nh < 0 || nh > 500) {
        toast.error(
          t("Orët e vlerësuara: 0–500", "Estimated hours must be a whole number from 0 to 500")
        );
        return;
      }
      estimatedHoursOut = nh;
    }

    const d = estimatedDaysOut ?? 0;
    const h = estimatedHoursOut ?? 0;
    const sum = d * WORKING_HOURS_PER_DAY + h;
    if (sum > MAX_RESOLUTION_HOURS) {
      toast.error(
        t(
          `Shuma ditë×${WORKING_HOURS_PER_DAY} + orë nuk mund të kalojë ${MAX_RESOLUTION_HOURS} orë gjithsej`,
          `Combined estimate (days×${WORKING_HOURS_PER_DAY}h + hours) cannot exceed ${MAX_RESOLUTION_HOURS} total hours`
        )
      );
      return;
    }
    if (sum === 0 && (rawDays.length > 0 || rawHours.length > 0)) {
      toast.error(
        t("Vendosni të paktën një ditë ose orë > 0", "Enter at least one day or hour greater than zero")
      );
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        priority: pri,
        assignedToId: assignee,
        estimatedDays: d,
        estimatedHours: h,
      };

      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success(t("Ops u ruajtën", "Ops settings saved"));
      onSaved?.();
      router.refresh();
    } catch {
      toast.error(t("Gabim", "Something went wrong"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <div className="space-y-5">
        <div className="space-y-2">
          <Label>{t("Cakto teknikun", "Assign engineer")}</Label>
          <Select
            value={assignee ?? "__none__"}
            onValueChange={(v) => setAssignee(v === "__none__" ? null : v)}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder={assigneeUnassignedLabel}>
                {assigneeTriggerLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} className="min-w-[var(--anchor-width)]">
              <SelectItem value="__none__">{t("I pacaktuar", "Unassigned")}</SelectItem>
              {engineers.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.firstName} {e.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t("Prioriteti", "Priority")}</Label>
          <Select value={pri} onValueChange={(v) => v && setPri(v as Priority)}>
            <SelectTrigger className="h-10 w-full">
              <SelectValue>{priorityTriggerLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} className="min-w-[var(--anchor-width)]">
              {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((p) => (
                <SelectItem key={p} value={p}>
                  {priorityLabels[p][locale === "sq" ? "sq" : "en"]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground">{t("Vlerësimi (SLA)", "Estimate (SLA)")}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`ops-est-days-${ticketId}`} className="text-xs font-normal text-muted-foreground">
                {t("Ditë kalendari", "Calendar days")}
              </Label>
              <Input
                id={`ops-est-days-${ticketId}`}
                type="number"
                min={0}
                max={62}
                step={1}
                inputMode="numeric"
                placeholder="0"
                value={daysInput}
                onChange={(e) => setDaysInput(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`ops-est-hours-${ticketId}`} className="text-xs font-normal text-muted-foreground">
                {t("Orë shtesë", "Additional hours")}
              </Label>
              <Input
                id={`ops-est-hours-${ticketId}`}
                type="number"
                min={0}
                max={500}
                step={1}
                inputMode="numeric"
                placeholder="0"
                value={hoursInput}
                onChange={(e) => setHoursInput(e.target.value)}
                className="h-10"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {t(
              `Afati SLA = data e krijimit + ditë×${WORKING_HOURS_PER_DAY} orë + orët (maks. ${MAX_RESOLUTION_HOURS} orë). Lëreni bosh për pa afat.`,
              `SLA deadline = created at + days×${WORKING_HOURS_PER_DAY}h + hours (max ${MAX_RESOLUTION_HOURS}h). Leave both empty for no SLA.`
            )}
          </p>
        </div>

        <Button type="button" className="w-full gap-2" onClick={save} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {t("Ruaj", "Save")}
        </Button>
      </div>
    </div>
  );
}
