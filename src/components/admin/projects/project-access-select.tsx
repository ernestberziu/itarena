"use client";

import { useTranslations } from "next-intl";
import { Shield } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PROJECT_ACCESS_LEVELS, type ProjectAccess } from "@/lib/projects/types";

/** Internal sentinel so the select stays controlled when nothing is chosen yet. */
const PERMISSION_NONE = "__permission_none__";

const triggerClassName =
  "h-10 w-full min-w-[11rem] rounded-xl border border-border/70 bg-white px-3 text-sm shadow-sm transition-colors hover:border-border focus-visible:ring-2 focus-visible:ring-ring/25 dark:bg-white";

export function ProjectAccessSelect({
  value,
  onChange,
  disabled,
  className,
  showLabel = false,
}: {
  value: ProjectAccess | "";
  onChange: (access: ProjectAccess) => void;
  disabled?: boolean;
  className?: string;
  showLabel?: boolean;
}) {
  const t = useTranslations("admin.projectsPage");
  const selectValue = value === "" ? PERMISSION_NONE : value;

  const accessLabel: Record<ProjectAccess, string> = {
    read: t("accessRead"),
    write: t("accessWrite"),
    admin: t("accessAdmin"),
  };

  const triggerLabel = value === "" ? t("permissionPlaceholder") : accessLabel[value];

  const field = (
    <Select
      value={selectValue}
      onValueChange={(v) => {
        if (v && v !== PERMISSION_NONE) onChange(v as ProjectAccess);
      }}
      disabled={disabled}
    >
      <SelectTrigger
        size="sm"
        aria-label={t("permissionPlaceholder")}
        className={cn(
          triggerClassName,
          value === "" && "text-muted-foreground",
          className
        )}
      >
        <Shield
          className="mr-1.5 h-3.5 w-3.5 shrink-0 opacity-60"
          strokeWidth={2}
          aria-hidden
        />
        <SelectValue placeholder={t("permissionPlaceholder")}>{triggerLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent
        alignItemWithTrigger={false}
        className="min-w-[var(--anchor-width)] rounded-xl border-border/80 bg-white p-1 text-foreground shadow-xl dark:bg-white"
      >
        {PROJECT_ACCESS_LEVELS.map((a) => (
          <SelectItem
            key={a}
            value={a}
            className="rounded-lg py-2 pr-8 pl-2.5 text-sm focus:bg-slate-50 data-highlighted:bg-slate-50"
          >
            {accessLabel[a]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  if (!showLabel) return field;

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{t("permissionLabel")}</p>
      {field}
    </div>
  );
}
