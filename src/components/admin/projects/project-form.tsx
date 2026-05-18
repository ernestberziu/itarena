"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/lib/projects/types";
import { ProjectOverviewFields } from "@/components/admin/projects/project-overview-fields";
import {
  ProjectTeamSection,
  type PendingMember,
  type ProjectMemberRow,
} from "@/components/admin/projects/project-team-section";
import {
  ProjectClientsSection,
  type PendingClient,
  type ProjectClientRow,
} from "@/components/admin/projects/project-clients-section";

export type ProjectFormPayload = {
  id: string;
  title: string;
  slug: string;
  status: ProjectStatus;
  description: string | null;
  updatedAt: string;
  createdBy: { id: string; firstName: string; lastName: string; email: string };
  members: ProjectMemberRow[];
  clients: ProjectClientRow[];
};

export function ProjectForm({
  mode,
  locale,
  listPrefix,
  canWrite,
  project,
  activeSection,
  onProjectUpdate,
}: {
  mode: "create" | "edit";
  locale: string;
  listPrefix: string;
  canWrite: boolean;
  project?: ProjectFormPayload;
  activeSection?: "overview" | "team" | "clients";
  onProjectUpdate?: (patch: Partial<ProjectFormPayload>) => void;
}) {
  const t = useTranslations("admin.projectsPage");
  const router = useRouter();

  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "ACTIVE");
  const [members, setMembers] = useState<ProjectMemberRow[]>(project?.members ?? []);
  const [clients, setClients] = useState<ProjectClientRow[]>(project?.clients ?? []);
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [pendingClients, setPendingClients] = useState<PendingClient[]>([]);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);

  async function saveOverview() {
    if (!project?.id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, status }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      onProjectUpdate?.({
        title: updated.title,
        description: updated.description,
        status: updated.status,
      });
      toast.success(t("saved"));
      router.refresh();
    } catch {
      toast.error(t("searchError"));
    } finally {
      setSaving(false);
    }
  }

  async function createProject() {
    if (!title.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          status,
          members: pendingMembers.map((m) => ({ userId: m.userId, access: m.access })),
          clients: pendingClients.map((c) => {
            if (c.kind === "company") return { companyId: c.companyId };
            if (c.kind === "user") return { userId: c.userId };
            if (c.kind === "external") return { label: c.label };
            return { invite: c.invite };
          }),
        }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      toast.success(t("created"));
      router.push(`${listPrefix}/admin/projects/${created.id}`);
    } catch {
      toast.error(t("searchError"));
    } finally {
      setCreating(false);
    }
  }

  const showOverview = mode === "create" || activeSection === "overview";
  const showTeam = mode === "create" || activeSection === "team";
  const showClients = mode === "create" || activeSection === "clients";

  if (mode === "create") {
    return (
      <div className="space-y-6">
        <section className="rounded-2xl border border-border/60 bg-card p-5 md:p-6 shadow-sm">
          <h2 className="text-sm font-semibold tracking-tight mb-4">{t("sections.overview")}</h2>
          <ProjectOverviewFields
            locale={locale}
            title={title}
            description={description}
            status={status}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onStatusChange={setStatus}
            canWrite={canWrite}
            showSaveButton={false}
          />
        </section>

        <section className="rounded-2xl border border-border/60 bg-card p-5 md:p-6 shadow-sm">
          <h2 className="text-sm font-semibold tracking-tight mb-4">{t("sections.team")}</h2>
          <ProjectTeamSection
            locale={locale}
            mode="create"
            members={[]}
            pendingMembers={pendingMembers}
            onPendingMembersChange={setPendingMembers}
            canWrite={canWrite}
          />
        </section>

        <section className="rounded-2xl border border-border/60 bg-card p-5 md:p-6 shadow-sm">
          <h2 className="text-sm font-semibold tracking-tight mb-4">{t("sections.clients")}</h2>
          <ProjectClientsSection
            locale={locale}
            mode="create"
            clients={[]}
            pendingClients={pendingClients}
            onPendingClientsChange={setPendingClients}
            canWrite={canWrite}
          />
        </section>

        {canWrite ? (
          <div className="flex justify-end">
            <Button size="lg" onClick={() => void createProject()} disabled={creating || !title.trim()}>
              {creating ? t("creating") : t("createProject")}
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showOverview ? (
        <ProjectOverviewFields
          locale={locale}
          title={title}
          description={description}
          status={status}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onStatusChange={setStatus}
          canWrite={canWrite}
          saving={saving}
          onSave={() => void saveOverview()}
        />
      ) : null}
      {showTeam ? (
        <ProjectTeamSection
          locale={locale}
          mode="edit"
          projectId={project?.id}
          members={members}
          onMembersChange={setMembers}
          canWrite={canWrite}
          createdById={project?.createdBy.id}
        />
      ) : null}
      {showClients ? (
        <ProjectClientsSection
          locale={locale}
          mode="edit"
          projectId={project?.id}
          clients={clients}
          onClientsChange={setClients}
          canWrite={canWrite}
        />
      ) : null}
    </div>
  );
}

export function ProjectFormCard({
  title,
  children,
  className,
  flush,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  /** Full-bleed content below the title (e.g. messaging thread). */
  flush?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]",
        flush ? "flex flex-col" : "p-5 md:p-6",
        className
      )}
    >
      <h2
        className={cn(
          "shrink-0 text-sm font-semibold tracking-tight text-foreground",
          flush
            ? "border-b border-border/60 px-5 py-4 md:px-6"
            : "mb-4"
        )}
      >
        {title}
      </h2>
      {flush ? <div className="min-h-0 flex-1">{children}</div> : children}
    </div>
  );
}
