"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TemplateOptionToggle } from "@/components/admin/templates/template-option-toggle";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  PROJECT_STEP_STATUSES,
  type ProjectStepRow,
  type ProjectStepStatus,
} from "@/lib/projects/step-types";
import {
  projectStepStatusBadgeClass,
  projectStepStatusLabel,
  projectStepStatusRailClass,
} from "@/lib/projects/step-status-ui";

export function ProjectStepItem({
  step,
  index,
  total,
  locale,
  projectId,
  canWrite,
  expanded,
  onToggle,
  onUpdated,
  onDeleted,
  onMove,
}: {
  step: ProjectStepRow;
  index: number;
  total: number;
  locale: string;
  projectId: string;
  canWrite: boolean;
  expanded: boolean;
  onToggle: () => void;
  onUpdated: (step: ProjectStepRow) => void;
  onDeleted: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
}) {
  const t = useTranslations("admin.projectsPage");
  const [title, setTitle] = useState(step.title);
  const [description, setDescription] = useState(step.description ?? "");
  const [status, setStatus] = useState<ProjectStepStatus>(step.status);
  const [clientVisible, setClientVisible] = useState(step.clientVisible);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setTitle(step.title);
    setDescription(step.description ?? "");
    setStatus(step.status);
    setClientVisible(step.clientVisible);
  }, [step]);

  const dirty =
    title.trim() !== step.title ||
    (description.trim() || null) !== (step.description?.trim() || null) ||
    status !== step.status ||
    clientVisible !== step.clientVisible;

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/steps/${step.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          status,
          clientVisible,
        }),
      });
      if (!res.ok) throw new Error();
      const updated = (await res.json()) as ProjectStepRow;
      onUpdated(updated);
      toast.success(t("stepSaved"));
    } catch {
      toast.error(t("searchError"));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/steps/${step.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      onDeleted(step.id);
      toast.success(t("stepDeleted"));
    } catch {
      toast.error(t("searchError"));
    } finally {
      setDeleting(false);
    }
  }

  const stepNum = String(index + 1).padStart(2, "0");

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]",
        "border-l-[3px]",
        projectStepStatusRailClass(step.status)
      )}
    >
      <div className="flex items-stretch gap-0">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex min-h-[52px] min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-inset"
        >
          <span className="shrink-0 font-mono text-xs font-semibold tabular-nums text-muted-foreground">
            {stepNum}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold">{step.title}</span>
          <Badge
            variant="outline"
            className={cn("shrink-0 text-[10px] font-medium", projectStepStatusBadgeClass(step.status))}
          >
            {projectStepStatusLabel(step.status, locale)}
          </Badge>
          {step.clientVisible && (
            <Eye className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
        </button>

        {canWrite && (
          <div className="flex shrink-0 flex-col border-l border-border/60">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-1/2 min-h-[26px] w-9 rounded-none border-0 border-b border-border/60"
              disabled={index === 0}
              aria-label={t("moveStepUp")}
              onClick={() => onMove(step.id, "up")}
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-1/2 min-h-[26px] w-9 rounded-none border-0"
              disabled={index >= total - 1}
              aria-label={t("moveStepDown")}
              onClick={() => onMove(step.id, "down")}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="border-t border-border/60 bg-muted/10 px-4 py-4 md:px-5">
          {canWrite ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor={`step-title-${step.id}`}>{t("stepTitle")}</Label>
                <Input
                  id={`step-title-${step.id}`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white dark:bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`step-desc-${step.id}`}>{t("stepDescription")}</Label>
                <Textarea
                  id={`step-desc-${step.id}`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="resize-y bg-white dark:bg-white"
                  placeholder={t("stepDescriptionPlaceholder")}
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5 md:max-w-xs">
                  <Label htmlFor={`step-status-${step.id}`}>{t("stepStatus")}</Label>
                  <Select
                    value={status}
                    onValueChange={(v) => setStatus(v as ProjectStepStatus)}
                  >
                    <SelectTrigger
                      id={`step-status-${step.id}`}
                      className="h-10 w-full rounded-xl border-border/70 bg-white shadow-sm dark:bg-white"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/80 bg-white dark:bg-white">
                      {PROJECT_STEP_STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="rounded-lg">
                          {projectStepStatusLabel(s, locale)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <TemplateOptionToggle
                  id={`step-client-visible-${step.id}`}
                  checked={clientVisible}
                  onCheckedChange={setClientVisible}
                  title={t("stepClientVisible")}
                  description={t("stepClientVisibleHint")}
                  icon={Eye}
                />
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1 text-destructive hover:text-destructive"
                  disabled={deleting}
                  onClick={() => void remove()}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("deleteStep")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={!dirty || !title.trim() || saving}
                  onClick={() => void save()}
                >
                  {saving ? t("saving") : t("save")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {step.description ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {step.description}
                </p>
              ) : (
                <p className="text-sm italic text-muted-foreground">{t("stepNoDescription")}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {step.clientVisible && (
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {t("stepClientVisible")}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
