"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Building2, Link2, Mail, Tag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AsyncEntityPicker } from "@/components/admin/projects/async-entity-picker";
import { ProjectModeTabs } from "@/components/admin/projects/project-mode-tabs";
import type { ProjectLookupItem } from "@/lib/projects/lookup-types";

export type ProjectClientRow = {
  id: string;
  label?: string | null;
  company: { id: string; name: string } | null;
  user: { id: string; firstName: string; lastName: string; email: string } | null;
};

export type PendingClient =
  | { kind: "company"; companyId: string; label: string; sublabel?: string }
  | { kind: "user"; userId: string; label: string; sublabel?: string }
  | { kind: "external"; label: string }
  | {
      kind: "invite";
      label: string;
      sublabel?: string;
      invite: { email: string; firstName: string; lastName: string };
    };

type ClientLinkMode = "existing" | "external" | "invite";
type ExistingKind = "company" | "user";

function pendingKey(c: PendingClient): string {
  if (c.kind === "company") return `c:${c.companyId}`;
  if (c.kind === "user") return `u:${c.userId}`;
  if (c.kind === "external") return `l:${c.label.toLowerCase()}`;
  return `i:${c.invite.email.toLowerCase()}`;
}

export function ProjectClientsSection({
  locale,
  projectId,
  clients,
  onClientsChange,
  pendingClients,
  onPendingClientsChange,
  canWrite,
  mode,
}: {
  locale: string;
  projectId?: string;
  clients: ProjectClientRow[];
  onClientsChange?: (clients: ProjectClientRow[]) => void;
  pendingClients?: PendingClient[];
  onPendingClientsChange?: (clients: PendingClient[]) => void;
  canWrite: boolean;
  mode: "create" | "edit";
}) {
  const t = useTranslations("admin.projectsPage");
  const [linkMode, setLinkMode] = useState<ClientLinkMode>("existing");
  const [existingKind, setExistingKind] = useState<ExistingKind>("company");
  const [selected, setSelected] = useState<ProjectLookupItem | null>(null);
  const [externalName, setExternalName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [adding, setAdding] = useState(false);

  const companyLabels = {
    placeholder: t("searchCompany"),
    empty: t("searchEmpty"),
    loading: t("searchLoading"),
    error: t("searchError"),
    minChars: t("searchMinChars"),
  };
  const userLabels = {
    placeholder: t("searchContact"),
    empty: t("searchEmpty"),
    loading: t("searchLoading"),
    error: t("searchError"),
    minChars: t("searchMinChars"),
  };

  function rowLabel(c: ProjectClientRow | PendingClient) {
    if ("id" in c && c.label && !c.company && !c.user) return c.label;
    if ("kind" in c && c.kind === "external") return c.label;
    if ("kind" in c) return c.label;
    return c.company?.name ?? (c.user ? `${c.user.firstName} ${c.user.lastName}` : c.label ?? "—");
  }

  function rowSub(c: ProjectClientRow | PendingClient) {
    if ("id" in c) {
      if (c.label && !c.company && !c.user) return t("clientNameOnly");
      if (c.company) return locale === "en" ? "Company" : "Kompania";
      if (c.user) return c.user.email;
      return undefined;
    }
    if (c.kind === "external") return t("clientNameOnly");
    if (c.kind === "invite") return c.sublabel ?? c.invite.email;
    if (c.kind === "company") return c.sublabel ?? (locale === "en" ? "Company" : "Kompania");
    return c.sublabel ?? c.label;
  }

  function rowIcon(c: ProjectClientRow | PendingClient) {
    if ("id" in c) {
      if (c.label && !c.company && !c.user) return Tag;
      if (c.company) return Building2;
      return User;
    }
    if (c.kind === "external") return Tag;
    if (c.kind === "invite") return Mail;
    if (c.kind === "company") return Building2;
    return User;
  }

  function resetForm() {
    setSelected(null);
    setExternalName("");
    setInviteEmail("");
    setInviteFirstName("");
    setInviteLastName("");
  }

  function switchLinkMode(next: ClientLinkMode) {
    setLinkMode(next);
    resetForm();
  }

  function buildBody():
    | { companyId: string }
    | { userId: string }
    | { label: string }
    | { invite: { email: string; firstName: string; lastName: string } }
    | null {
    if (linkMode === "existing") {
      if (!selected) return null;
      return existingKind === "company"
        ? { companyId: selected.id }
        : { userId: selected.id };
    }
    if (linkMode === "external") {
      const label = externalName.trim();
      if (label.length < 2) return null;
      return { label };
    }
    const email = inviteEmail.trim().toLowerCase();
    const firstName = inviteFirstName.trim();
    const lastName = inviteLastName.trim();
    if (!email || firstName.length < 2 || lastName.length < 2) return null;
    return { invite: { email, firstName, lastName } };
  }

  function buildPending(): PendingClient | null {
    const body = buildBody();
    if (!body) return null;

    if ("companyId" in body && selected) {
      return {
        kind: "company",
        companyId: body.companyId,
        label: selected.label,
        sublabel: selected.sublabel,
      };
    }
    if ("userId" in body && selected) {
      return {
        kind: "user",
        userId: body.userId,
        label: selected.label,
        sublabel: selected.sublabel,
      };
    }
    if ("label" in body) {
      return { kind: "external", label: body.label };
    }
    if ("invite" in body) {
      return {
        kind: "invite",
        label: `${body.invite.firstName} ${body.invite.lastName}`,
        sublabel: body.invite.email,
        invite: body.invite,
      };
    }
    return null;
  }

  function canSubmit(): boolean {
    return buildBody() !== null;
  }

  async function addClientEdit() {
    const body = buildBody();
    if (!projectId || !body) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        toast.error(t("clientEmailExists"));
        return;
      }
      if (!res.ok) throw new Error();
      onClientsChange?.([...clients, data as ProjectClientRow]);
      resetForm();
      if (data.invite?.emailSent === false && data.invite?.tempPassword) {
        toast.success(t("clientAdded"), {
          description: `${t("inviteNoEmail")}: ${data.invite.tempPassword}`,
        });
      } else {
        toast.success(t("clientAdded"));
      }
    } catch {
      toast.error(t("searchError"));
    } finally {
      setAdding(false);
    }
  }

  function addClientCreate() {
    const pending = buildPending();
    if (!pending || !onPendingClientsChange) return;
    const key = pendingKey(pending);
    if (pendingClients?.some((p) => pendingKey(p) === key)) {
      toast.error(t("clientDuplicate"));
      return;
    }
    onPendingClientsChange([...(pendingClients ?? []), pending]);
    resetForm();
  }

  async function removeClientEdit(clientLinkId: string) {
    if (!projectId) return;
    const res = await fetch(
      `/api/admin/projects/${projectId}/clients?clientLinkId=${clientLinkId}`,
      { method: "DELETE" }
    );
    if (!res.ok) {
      toast.error(t("searchError"));
      return;
    }
    onClientsChange?.(clients.filter((c) => c.id !== clientLinkId));
  }

  function removeClientCreate(index: number) {
    onPendingClientsChange?.((pendingClients ?? []).filter((_, i) => i !== index));
  }

  const displayClients = mode === "edit" ? clients : [];
  const displayPending = mode === "create" ? (pendingClients ?? []) : [];

  const modeTabs = [
    { id: "existing" as const, label: t("clientModeExisting"), icon: User },
    { id: "external" as const, label: t("clientModeNameOnly"), icon: Tag },
    { id: "invite" as const, label: t("clientModeInvite"), icon: Mail },
  ];

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {displayClients.map((c) => {
          const Icon = rowIcon(c);
          return (
            <li
              key={c.id}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/10 px-3 py-2.5"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{rowLabel(c)}</p>
                {rowSub(c) ? (
                  <p className="truncate text-xs text-muted-foreground">{rowSub(c)}</p>
                ) : null}
              </div>
              {canWrite ? (
                <Button variant="outline" size="sm" onClick={() => void removeClientEdit(c.id)}>
                  {t("remove")}
                </Button>
              ) : null}
            </li>
          );
        })}
        {displayPending.map((c, i) => {
          const Icon = rowIcon(c);
          return (
            <li
              key={`${pendingKey(c)}-${i}`}
              className="flex items-center gap-3 rounded-xl border border-dashed border-border/60 px-3 py-2.5"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{rowLabel(c)}</p>
                {rowSub(c) ? (
                  <p className="truncate text-xs text-muted-foreground">{rowSub(c)}</p>
                ) : null}
              </div>
              {canWrite ? (
                <Button variant="outline" size="sm" onClick={() => removeClientCreate(i)}>
                  {t("remove")}
                </Button>
              ) : null}
            </li>
          );
        })}
        {displayClients.length === 0 && displayPending.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">{t("noClients")}</p>
        ) : null}
      </ul>

      {canWrite ? (
        <div className="space-y-4 rounded-xl border border-border/50 bg-muted/15 p-4">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Link2 className="h-4 w-4" strokeWidth={2} />
            {t("addClient")}
          </p>

          <ProjectModeTabs value={linkMode} onChange={switchLinkMode} options={modeTabs} />

          {linkMode === "existing" ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">{t("clientExistingType")}</p>
                <ProjectModeTabs
                  layout="row"
                  value={existingKind}
                  onChange={(kind) => {
                    setExistingKind(kind);
                    setSelected(null);
                  }}
                  options={[
                    { id: "company", label: t("linkCompany"), icon: Building2 },
                    { id: "user", label: t("linkContact"), icon: User },
                  ]}
                />
              </div>
              <AsyncEntityPicker
                key={existingKind}
                className="w-full"
                fetchUrl={
                  existingKind === "company"
                    ? "/api/admin/projects/lookup/companies"
                    : "/api/admin/projects/lookup/client-users"
                }
                labels={existingKind === "company" ? companyLabels : userLabels}
                onSelect={setSelected}
                disabled={adding}
              />
              {selected ? (
                <p className="text-xs text-muted-foreground">
                  {t("selected")}:{" "}
                  <span className="font-medium text-foreground">{selected.label}</span>
                </p>
              ) : null}
            </div>
          ) : linkMode === "external" ? (
            <div className="space-y-2">
              <Label htmlFor="project-client-external">{t("clientExternalLabel")}</Label>
              <Input
                id="project-client-external"
                maxLength={200}
                placeholder={t("clientExternalPlaceholder")}
                value={externalName}
                onChange={(e) => setExternalName(e.target.value)}
                disabled={adding}
              />
              <p className="text-xs text-muted-foreground">{t("clientExternalHint")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">{t("clientInviteHint")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="project-client-invite-email">Email</Label>
                  <Input
                    id="project-client-invite-email"
                    type="email"
                    autoComplete="off"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    disabled={adding}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-client-invite-fn">{t("clientInviteFirstName")}</Label>
                  <Input
                    id="project-client-invite-fn"
                    value={inviteFirstName}
                    onChange={(e) => setInviteFirstName(e.target.value)}
                    disabled={adding}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-client-invite-ln">{t("clientInviteLastName")}</Label>
                  <Input
                    id="project-client-invite-ln"
                    value={inviteLastName}
                    onChange={(e) => setInviteLastName(e.target.value)}
                    disabled={adding}
                  />
                </div>
              </div>
            </div>
          )}

          <Button
            type="button"
            disabled={!canSubmit() || adding}
            onClick={() => (mode === "edit" ? void addClientEdit() : addClientCreate())}
          >
            {adding ? t("searchLoading") : t("addClient")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
