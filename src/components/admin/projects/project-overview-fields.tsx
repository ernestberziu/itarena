"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROJECT_STATUSES, type ProjectStatus } from "@/lib/projects/types";
import { projectStatusLabel } from "@/lib/projects/status-ui";

export function ProjectOverviewFields({
  locale,
  title,
  description,
  status,
  onTitleChange,
  onDescriptionChange,
  onStatusChange,
  canWrite,
  saving,
  onSave,
  showSaveButton = true,
}: {
  locale: string;
  title: string;
  description: string;
  status: ProjectStatus;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onStatusChange: (v: ProjectStatus) => void;
  canWrite: boolean;
  saving?: boolean;
  onSave?: () => void;
  showSaveButton?: boolean;
}) {
  const t = useTranslations("admin.projectsPage");
  const en = locale === "en";

  return (
    <div className="space-y-5 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="project-title">{en ? "Title" : "Titulli"}</Label>
        <Input
          id="project-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          disabled={!canWrite}
          className="h-10"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="project-desc">{en ? "Description" : "Përshkrimi"}</Label>
        <Textarea
          id="project-desc"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={4}
          disabled={!canWrite}
          className="resize-y"
        />
      </div>
      <div className="space-y-2">
        <Label>{en ? "Status" : "Statusi"}</Label>
        <Select
          value={status}
          onValueChange={(v) => v && onStatusChange(v as ProjectStatus)}
          disabled={!canWrite}
        >
          <SelectTrigger className="h-10 w-full max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROJECT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {projectStatusLabel(s, locale)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {showSaveButton && canWrite && onSave ? (
        <Button onClick={onSave} disabled={saving || !title.trim()}>
          {saving ? t("saving") : t("save")}
        </Button>
      ) : null}
    </div>
  );
}
