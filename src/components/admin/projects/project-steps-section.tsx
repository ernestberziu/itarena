"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ListOrdered, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProjectFormCard } from "@/components/admin/projects/project-form";
import { ProjectStepsSummary } from "@/components/admin/projects/project-steps-summary";
import { ProjectStepItem } from "@/components/admin/projects/project-step-item";
import type { ProjectStepRow } from "@/lib/projects/step-types";

export function ProjectStepsSection({
  projectId,
  locale,
  initialSteps,
  canWrite,
}: {
  projectId: string;
  locale: string;
  initialSteps: ProjectStepRow[];
  canWrite: boolean;
}) {
  const t = useTranslations("admin.projectsPage");
  const [steps, setSteps] = useState<ProjectStepRow[]>(initialSteps);
  const [expandedId, setExpandedId] = useState<string | null>(() => {
    const inProgress = initialSteps.find((s) => s.status === "IN_PROGRESS");
    return inProgress?.id ?? null;
  });
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const sorted = useMemo(
    () => [...steps].sort((a, b) => a.sortOrder - b.sortOrder),
    [steps]
  );

  async function reorder(orderedIds: string[]) {
    const res = await fetch(`/api/admin/projects/${projectId}/steps/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds }),
    });
    if (!res.ok) throw new Error();
  }

  function handleMove(id: string, direction: "up" | "down") {
    const ids = sorted.map((s) => s.id);
    const i = ids.indexOf(id);
    if (i < 0) return;
    const j = direction === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j]!, ids[i]!];
    const reordered = ids.map((stepId, sortOrder) => {
      const s = sorted.find((x) => x.id === stepId)!;
      return { ...s, sortOrder };
    });
    setSteps(reordered);
    void reorder(ids).catch(() => {
      toast.error(t("searchError"));
      setSteps(sorted);
    });
  }

  async function createStep() {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim() || null,
          status: "OPEN",
        }),
      });
      if (!res.ok) throw new Error();
      const step = (await res.json()) as ProjectStepRow;
      setSteps((prev) => [...prev, step]);
      setExpandedId(step.id);
      setNewTitle("");
      setNewDescription("");
      setShowAdd(false);
      toast.success(t("stepCreated"));
    } catch {
      toast.error(t("searchError"));
    } finally {
      setCreating(false);
    }
  }

  return (
    <ProjectFormCard title={t("sections.steps")}>
      <div className="space-y-5">
        <ProjectStepsSummary steps={sorted} locale={locale} />

        {canWrite && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              size="sm"
              className="gap-1.5"
              onClick={() => setShowAdd((v) => !v)}
            >
              <Plus className="h-3.5 w-3.5" />
              {t("addStep")}
            </Button>
          </div>
        )}

        {showAdd && canWrite && (
          <div className="space-y-3 rounded-2xl border border-dashed border-border/80 bg-muted/10 p-4 md:p-5">
            <div className="space-y-1.5">
              <Label htmlFor="new-step-title">{t("stepTitle")}</Label>
              <Input
                id="new-step-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t("stepTitlePlaceholder")}
                className="bg-white dark:bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-step-desc">{t("stepDescription")}</Label>
              <Textarea
                id="new-step-desc"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
                placeholder={t("stepDescriptionPlaceholder")}
                className="resize-y bg-white dark:bg-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAdd(false)}>
                {t("cancelStep")}
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!newTitle.trim() || creating}
                onClick={() => void createStep()}
              >
                {creating ? t("creating") : t("createStep")}
              </Button>
            </div>
          </div>
        )}

        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-muted/10 px-6 py-12 text-center">
            <ListOrdered className="mb-3 h-10 w-10 text-muted-foreground/60" strokeWidth={1.5} />
            <p className="text-sm font-medium">{t("noSteps")}</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">{t("noStepsHint")}</p>
            {canWrite && (
              <Button
                type="button"
                size="sm"
                className="mt-4 gap-1.5"
                onClick={() => setShowAdd(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                {t("addStep")}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((step, i) => (
              <ProjectStepItem
                key={step.id}
                step={step}
                index={i}
                total={sorted.length}
                locale={locale}
                projectId={projectId}
                canWrite={canWrite}
                expanded={expandedId === step.id}
                onToggle={() =>
                  setExpandedId((prev) => (prev === step.id ? null : step.id))
                }
                onUpdated={(updated) =>
                  setSteps((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
                }
                onDeleted={(id) => {
                  setSteps((prev) => prev.filter((s) => s.id !== id));
                  setExpandedId((prev) => (prev === id ? null : prev));
                }}
                onMove={handleMove}
              />
            ))}
          </div>
        )}
      </div>
    </ProjectFormCard>
  );
}
