"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AsyncEntityPicker } from "@/components/admin/projects/async-entity-picker";
import { ProjectAccessSelect } from "@/components/admin/projects/project-access-select";
import type { ProjectLookupItem } from "@/lib/projects/lookup-types";
import type { ProjectAccess } from "@/lib/projects/types";

export type ProjectMemberRow = {
  id: string;
  access: ProjectAccess;
  user: { id: string; firstName: string; lastName: string; email: string; role: string };
};

export type PendingMember = {
  userId: string;
  access: ProjectAccess;
  label: string;
  sublabel?: string;
  meta?: string;
};

function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "?";
}

function accessLabel(access: ProjectAccess, t: (k: string) => string) {
  if (access === "read") return t("accessRead");
  if (access === "write") return t("accessWrite");
  return t("accessAdmin");
}

export function ProjectTeamSection({
  locale,
  projectId,
  members,
  onMembersChange,
  pendingMembers,
  onPendingMembersChange,
  canWrite,
  createdById,
  mode,
}: {
  locale: string;
  projectId?: string;
  members: ProjectMemberRow[];
  onMembersChange?: (members: ProjectMemberRow[]) => void;
  pendingMembers?: PendingMember[];
  onPendingMembersChange?: (members: PendingMember[]) => void;
  canWrite: boolean;
  createdById?: string;
  mode: "create" | "edit";
}) {
  const t = useTranslations("admin.projectsPage");
  const [selectedStaff, setSelectedStaff] = useState<ProjectLookupItem | null>(null);
  const [access, setAccess] = useState<ProjectAccess | "">("");
  const [adding, setAdding] = useState(false);

  const pickerLabels = {
    placeholder: t("searchStaff"),
    empty: t("searchEmpty"),
    loading: t("searchLoading"),
    error: t("searchError"),
    minChars: t("searchMinChars"),
  };

  async function addMemberEdit() {
    if (!projectId || !selectedStaff || !access) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedStaff.id, access }),
      });
      if (!res.ok) throw new Error();
      const member = await res.json();
      onMembersChange?.([
        ...members.filter((m) => m.user.id !== member.user.id),
        member,
      ]);
      setSelectedStaff(null);
      setAccess("");
      toast.success(t("memberAdded"));
    } catch {
      toast.error(t("searchError"));
    } finally {
      setAdding(false);
    }
  }

  function addMemberCreate() {
    if (!selectedStaff || !access || !onPendingMembersChange) return;
    if (pendingMembers?.some((m) => m.userId === selectedStaff.id)) {
      toast.error(t("memberDuplicate"));
      return;
    }
    onPendingMembersChange([
      ...(pendingMembers ?? []),
      {
        userId: selectedStaff.id,
        access,
        label: selectedStaff.label,
        sublabel: selectedStaff.sublabel,
        meta: selectedStaff.meta,
      },
    ]);
    setSelectedStaff(null);
    setAccess("");
  }

  async function removeMemberEdit(memberId: string) {
    if (!projectId) return;
    const res = await fetch(
      `/api/admin/projects/${projectId}/members?memberId=${memberId}`,
      { method: "DELETE" }
    );
    if (!res.ok) {
      toast.error(t("searchError"));
      return;
    }
    onMembersChange?.(members.filter((m) => m.id !== memberId));
  }

  function removeMemberCreate(userId: string) {
    onPendingMembersChange?.((pendingMembers ?? []).filter((m) => m.userId !== userId));
  }

  const displayPending = mode === "create" ? (pendingMembers ?? []) : [];
  const displayMembers = mode === "edit" ? members : [];

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {displayMembers.map((m) => (
          <li
            key={m.id}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/10 px-3 py-2.5"
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
              aria-hidden
            >
              {initials(m.user.firstName, m.user.lastName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {m.user.firstName} {m.user.lastName}
              </p>
              <p className="truncate text-xs text-muted-foreground">{m.user.email}</p>
            </div>
            <Badge variant="outline" className="shrink-0 text-[10px] uppercase">
              {m.user.role}
            </Badge>
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              {accessLabel(m.access, t)}
            </Badge>
            {canWrite && m.user.id !== createdById ? (
              <Button variant="outline" size="sm" onClick={() => void removeMemberEdit(m.id)}>
                {t("remove")}
              </Button>
            ) : null}
          </li>
        ))}
        {displayPending.map((m) => (
          <li
            key={m.userId}
            className="flex items-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/5 px-3 py-2.5"
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold"
              aria-hidden
            >
              {m.label.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{m.label}</p>
              {m.sublabel ? (
                <p className="truncate text-xs text-muted-foreground">{m.sublabel}</p>
              ) : null}
            </div>
            {m.meta ? (
              <Badge variant="outline" className="shrink-0 text-[10px] uppercase">
                {m.meta}
              </Badge>
            ) : null}
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              {accessLabel(m.access, t)}
            </Badge>
            {canWrite ? (
              <Button variant="outline" size="sm" onClick={() => removeMemberCreate(m.userId)}>
                {t("remove")}
              </Button>
            ) : null}
          </li>
        ))}
        {displayMembers.length === 0 && displayPending.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">{t("noTeam")}</p>
        ) : null}
      </ul>

      {canWrite ? (
        <div className="rounded-xl border border-border/50 bg-muted/15 p-4 space-y-3">
          <p className="text-sm font-medium flex items-center gap-2">
            <UserPlus className="h-4 w-4" strokeWidth={2} />
            {t("addMember")}
          </p>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_12.5rem_auto] lg:items-end">
            <AsyncEntityPicker
              fetchUrl="/api/admin/projects/lookup/staff"
              labels={pickerLabels}
              onSelect={setSelectedStaff}
              queryParams={projectId ? { excludeProjectId: projectId } : undefined}
              disabled={adding}
            />
            <ProjectAccessSelect
              value={access}
              onChange={setAccess}
              disabled={adding}
              showLabel
            />
            <Button
              type="button"
              disabled={!selectedStaff || !access || adding}
              onClick={() => (mode === "edit" ? void addMemberEdit() : addMemberCreate())}
            >
              {adding ? t("searchLoading") : t("addMember")}
            </Button>
          </div>
          {selectedStaff ? (
            <p className="text-xs text-muted-foreground">
              {t("selected")}: <span className="font-medium text-foreground">{selectedStaff.label}</span>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
