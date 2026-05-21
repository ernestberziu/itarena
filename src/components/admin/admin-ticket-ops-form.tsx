"use client";
import { useUiT } from "@/hooks/use-ui-t";

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
import { TICKET_PROJECT_STAFF_CONFLICT } from "@/lib/ticket-project";

export type EngineerOption = { id: string; firstName: string; lastName: string };
export type ProjectOption = { id: string; title: string };

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
  projects,
  assignedToId,
  projectId,
  priority,
  estimatedDays,
  estimatedHours,
  onSaved,
  className,
}: {
  ticketId: string;
  locale: string;
  engineers: EngineerOption[];
  projects: ProjectOption[];
  assignedToId: string | null;
  projectId: string | null;
  priority: Priority;
  estimatedDays: number | null;
  estimatedHours: number | null;
  onSaved?: () => void;
  className?: string;
}) {
  const router = useRouter();
  const tUi = useUiT();
  const [loading, setLoading] = useState(false);
  const [assignee, setAssignee] = useState<string | null>(assignedToId);
  const [project, setProject] = useState<string | null>(projectId);
  const [pri, setPri] = useState<Priority>(priority);
  const init = inputsFromEstimate(estimatedDays, estimatedHours);
  const [daysInput, setDaysInput] = useState(init.days);
  const [hoursInput, setHoursInput] = useState(init.hours);

  const staffAssignBlocked = Boolean(project?.trim());

  useEffect(() => {
    const next = inputsFromEstimate(estimatedDays, estimatedHours);
    setDaysInput(next.days);
    setHoursInput(next.hours);
    setAssignee(assignedToId);
    setProject(projectId);
    setPri(priority);
  }, [estimatedDays, estimatedHours, assignedToId, projectId, priority]);

  const priorityLabels: Record<Priority, { sq: string; en: string }> = {
    LOW: { sq: "E Ulët", en: "Low" },
    MEDIUM: { sq: "Mesatare", en: "Medium" },
    HIGH: { sq: "E Lartë", en: "High" },
    CRITICAL: { sq: "Kritike", en: "Critical" },
  };

  const selectedEngineer = assignee ? engineers.find((e) => e.id === assignee) : undefined;
  const assigneeUnassignedLabel = tUi("unassigned");
  const assigneeTriggerLabel = selectedEngineer
    ? `${selectedEngineer.firstName} ${selectedEngineer.lastName}`.trim()
    : assigneeUnassignedLabel;
  const priorityTriggerLabel =
    priorityLabels[pri]?.[locale === "sq" ? "sq" : "en"] ?? pri;

  const selectedProject = project ? projects.find((p) => p.id === project) : undefined;
  const projectNoneLabel = tUi("no_project");
  const projectTriggerLabel = selectedProject?.title ?? projectNoneLabel;

  function onProjectChange(value: string) {
    const next = value === "__none__" ? null : value;
    setProject(next);
    if (next) setAssignee(null);
  }

  async function save() {
    if (staffAssignBlocked && assignee) {
      toast.error(
        locale === "sq"
          ? TICKET_PROJECT_STAFF_CONFLICT
          : TICKET_PROJECT_STAFF_CONFLICT
      );
      return;
    }

    let estimatedDaysOut: number | undefined;
    let estimatedHoursOut: number | undefined;
    const rawDays = daysInput.trim();
    const rawHours = hoursInput.trim();

    if (rawDays.length > 0) {
      const nd = Number.parseInt(rawDays, 10);
      if (Number.isNaN(nd) || nd < 0 || nd > 62) {
        toast.error(
          tUi("estimated_days_must_be_a_whole_number_from_0_to_")
        );
        return;
      }
      estimatedDaysOut = nd;
    }
    if (rawHours.length > 0) {
      const nh = Number.parseInt(rawHours, 10);
      if (Number.isNaN(nh) || nh < 0 || nh > 500) {
        toast.error(
          tUi("estimated_hours_must_be_a_whole_number_from_0_to")
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
        tUi("estimate_hours_exceeded", {
          hoursPerDay: WORKING_HOURS_PER_DAY,
          maxHours: MAX_RESOLUTION_HOURS,
        })
      );
      return;
    }
    if (sum === 0 && (rawDays.length > 0 || rawHours.length > 0)) {
      toast.error(
        tUi("enter_at_least_one_day_or_hour_greater_than_zero")
      );
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        priority: pri,
        projectId: project,
        assignedToId: staffAssignBlocked ? null : assignee,
        estimatedDays: d,
        estimatedHours: h,
      };

      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? "save_failed");
      }
      toast.success(tUi("ops_settings_saved"));
      onSaved?.();
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error && e.message !== "save_failed" ? e.message : null;
      toast.error(msg ?? tUi("something_went_wrong"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <div className="space-y-5">
        {(projects.length > 0 || project) && (
          <div className="space-y-2">
            <Label>{tUi("project")}</Label>
            <Select
              value={project ?? "__none__"}
              onValueChange={(v) => onProjectChange(v ?? "__none__")}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder={projectNoneLabel}>{projectTriggerLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false} className="min-w-[var(--anchor-width)]">
                <SelectItem value="__none__">{projectNoneLabel}</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {tUi("project_tickets_use_the_project_team_not_an_indi")}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label>{tUi("assign_engineer")}</Label>
          <Select
            value={assignee ?? "__none__"}
            onValueChange={(v) => setAssignee(v === "__none__" ? null : v)}
            disabled={staffAssignBlocked}
          >
            <SelectTrigger className="h-10 w-full" disabled={staffAssignBlocked}>
              <SelectValue placeholder={assigneeUnassignedLabel}>
                {staffAssignBlocked ? assigneeUnassignedLabel : assigneeTriggerLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} className="min-w-[var(--anchor-width)]">
              <SelectItem value="__none__">{assigneeUnassignedLabel}</SelectItem>
              {engineers.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.firstName} {e.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {staffAssignBlocked && (
            <p className="text-xs text-muted-foreground">
              {tUi("remove_the_project_to_assign_an_individual_engin")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>{tUi("priority")}</Label>
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
          <p className="text-xs font-medium text-foreground">{tUi("estimate_sla")}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`ops-est-days-${ticketId}`} className="text-xs font-normal text-muted-foreground">
                {tUi("calendar_days")}
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
                {tUi("additional_hours")}
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
            {tUi("sla_deadline_help", {
              hoursPerDay: WORKING_HOURS_PER_DAY,
              maxHours: MAX_RESOLUTION_HOURS,
            })}
          </p>
        </div>

        <Button type="button" className="w-full gap-2" onClick={save} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {tUi("save")}
        </Button>
      </div>
    </div>
  );
}
