"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn, formatDateTime, timeAgo } from "@/lib/utils";
import type { ProjectAccess, ProjectStatus } from "@/lib/projects/types";
import { PROJECT_ACCESS_LEVELS } from "@/lib/projects/types";

type Section = "overview" | "clients" | "tickets" | "messages" | "team";

type ProjectPayload = {
  id: string;
  title: string;
  slug: string;
  status: ProjectStatus;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; firstName: string; lastName: string; email: string };
  members: Array<{
    id: string;
    access: ProjectAccess;
    user: { id: string; firstName: string; lastName: string; email: string; role: string };
  }>;
  clients: Array<{
    id: string;
    company: { id: string; name: string } | null;
    user: { id: string; firstName: string; lastName: string; email: string } | null;
  }>;
};

type MessageRow = {
  id: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string; role: string };
};

type TicketRow = {
  id: string;
  number: string;
  title: string;
  status: string;
  priority: string;
  updatedAt: string;
};

const SECTIONS: Section[] = ["overview", "clients", "tickets", "messages", "team"];

export function ProjectWorkspace({
  project: initial,
  messages: initialMessages,
  tickets: initialTickets,
  locale,
  listPrefix,
  canWrite,
}: {
  project: ProjectPayload;
  messages: MessageRow[];
  tickets: TicketRow[];
  locale: string;
  listPrefix: string;
  canWrite: boolean;
}) {
  const t = useTranslations("admin.projectsPage");
  const router = useRouter();
  const [section, setSection] = useState<Section>("overview");
  const [project, setProject] = useState(initial);
  const [messages, setMessages] = useState(initialMessages);
  const [tickets] = useState(initialTickets);
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description ?? "");
  const [status, setStatus] = useState(project.status);
  const [messageBody, setMessageBody] = useState("");
  const [messageInternal, setMessageInternal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newMemberId, setNewMemberId] = useState("");
  const [newMemberAccess, setNewMemberAccess] = useState<ProjectAccess>("read");
  const [newCompanyId, setNewCompanyId] = useState("");
  const [newUserId, setNewUserId] = useState("");

  async function saveOverview() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, status }),
      });
      if (!res.ok) throw new Error("Save failed");
      const updated = await res.json();
      setProject((p) => ({ ...p, ...updated, createdAt: p.createdAt }));
      toast.success(locale === "sq" ? "U ruajt" : "Saved");
      router.refresh();
    } catch {
      toast.error(locale === "sq" ? "Gabim" : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function postMessage() {
    if (!messageBody.trim()) return;
    const res = await fetch(`/api/admin/projects/${project.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: messageBody, isInternal: messageInternal }),
    });
    if (!res.ok) {
      toast.error(locale === "sq" ? "Gabim" : "Error");
      return;
    }
    const msg = await res.json();
    setMessages((m) => [...m, msg]);
    setMessageBody("");
    setMessageInternal(false);
    toast.success(locale === "sq" ? "Mesazhi u dërgua" : "Message sent");
  }

  async function addMember() {
    if (!newMemberId.trim()) return;
    const res = await fetch(`/api/admin/projects/${project.id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: newMemberId.trim(), access: newMemberAccess }),
    });
    if (!res.ok) {
      toast.error(locale === "sq" ? "Gabim" : "Error");
      return;
    }
    const member = await res.json();
    setProject((p) => ({
      ...p,
      members: [...p.members.filter((m) => m.user.id !== member.user.id), member],
    }));
    setNewMemberId("");
    toast.success(locale === "sq" ? "Anëtari u shtua" : "Member added");
  }

  async function removeMember(memberId: string) {
    const res = await fetch(
      `/api/admin/projects/${project.id}/members?memberId=${memberId}`,
      { method: "DELETE" }
    );
    if (!res.ok) {
      toast.error(locale === "sq" ? "Gabim" : "Error");
      return;
    }
    setProject((p) => ({ ...p, members: p.members.filter((m) => m.id !== memberId) }));
  }

  async function addClient() {
    if (!newCompanyId.trim() && !newUserId.trim()) return;
    const res = await fetch(`/api/admin/projects/${project.id}/clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId: newCompanyId.trim() || null,
        userId: newUserId.trim() || null,
      }),
    });
    if (!res.ok) {
      toast.error(locale === "sq" ? "Gabim" : "Error");
      return;
    }
    const link = await res.json();
    setProject((p) => ({ ...p, clients: [...p.clients, link] }));
    setNewCompanyId("");
    setNewUserId("");
    toast.success(locale === "sq" ? "Klienti u lidh" : "Client linked");
  }

  async function removeClient(clientLinkId: string) {
    const res = await fetch(
      `/api/admin/projects/${project.id}/clients?clientLinkId=${clientLinkId}`,
      { method: "DELETE" }
    );
    if (!res.ok) {
      toast.error(locale === "sq" ? "Gabim" : "Error");
      return;
    }
    setProject((p) => ({ ...p, clients: p.clients.filter((c) => c.id !== clientLinkId) }));
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title={project.title}
        description={`${project.createdBy.firstName} ${project.createdBy.lastName} · ${timeAgo(project.updatedAt)}`}
        toolbar={
          <Button variant="outline" size="sm" asChild>
            <Link href={`${listPrefix}/admin/projects`}>
              {locale === "sq" ? "← Projektet" : "← Projects"}
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {SECTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSection(s)}
              className={cn(
                "rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                section === s
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {t(`sections.${s}`)}
            </button>
          ))}
        </nav>

        <div className="min-w-0 rounded-xl border border-border/80 bg-card p-4 md:p-6">
          {section === "overview" && (
            <div className="space-y-4 max-w-lg">
              <div className="space-y-2">
                <Label>{locale === "sq" ? "Titulli" : "Title"}</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} disabled={!canWrite} />
              </div>
              <div className="space-y-2">
                <Label>{locale === "sq" ? "Përshkrimi" : "Description"}</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  disabled={!canWrite}
                />
              </div>
              <div className="space-y-2">
                <Label>{locale === "sq" ? "Statusi" : "Status"}</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  disabled={!canWrite}
                >
                  <option value="ACTIVE">{t("active")}</option>
                  <option value="ARCHIVED">{t("archived")}</option>
                </select>
              </div>
              {canWrite && (
                <Button onClick={saveOverview} disabled={saving}>
                  {saving ? (locale === "sq" ? "Duke ruajtur…" : "Saving…") : locale === "sq" ? "Ruaj" : "Save"}
                </Button>
              )}
            </div>
          )}

          {section === "clients" && (
            <div className="space-y-4">
              <ul className="space-y-2">
                {project.clients.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <span>
                      {c.company?.name ??
                        (c.user ? `${c.user.firstName} ${c.user.lastName}` : "—")}
                    </span>
                    {canWrite && (
                      <Button variant="outline" size="sm" onClick={() => removeClient(c.id)}>
                        {locale === "sq" ? "Hiq" : "Remove"}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
              {canWrite && (
                <div className="space-y-2 border-t pt-4">
                  <p className="text-sm font-medium">{t("addClient")}</p>
                  <Input
                    placeholder={locale === "sq" ? "ID kompanie (cuid)" : "Company ID (cuid)"}
                    value={newCompanyId}
                    onChange={(e) => setNewCompanyId(e.target.value)}
                  />
                  <Input
                    placeholder={locale === "sq" ? "ID përdoruesi (cuid)" : "User ID (cuid)"}
                    value={newUserId}
                    onChange={(e) => setNewUserId(e.target.value)}
                  />
                  <Button size="sm" onClick={addClient}>
                    {t("addClient")}
                  </Button>
                </div>
              )}
            </div>
          )}

          {section === "tickets" && (
            <div className="space-y-4">
              {canWrite && (
                <Button size="sm" asChild>
                  <Link href={`${listPrefix}/admin/tickets/new?projectId=${project.id}`}>
                    {t("addTicket")}
                  </Link>
                </Button>
              )}
              <ul className="space-y-2">
                {tickets.map((tk) => (
                  <li key={tk.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <div>
                      <Link
                        href={`${listPrefix}/admin/tickets/${tk.id}`}
                        className="font-mono text-xs text-muted-foreground hover:text-primary"
                      >
                        {tk.number}
                      </Link>
                      <p className="text-sm font-medium">{tk.title}</p>
                    </div>
                    <Badge variant="outline">{tk.status}</Badge>
                  </li>
                ))}
                {tickets.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t("noProjects")}</p>
                )}
              </ul>
            </div>
          )}

          {section === "messages" && (
            <div className="space-y-4">
              <ul className="space-y-3 max-h-[400px] overflow-y-auto">
                {messages.map((m) => (
                  <li
                    key={m.id}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm",
                      m.isInternal && "border-amber-200/60 bg-amber-50/50 dark:bg-amber-950/20"
                    )}
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <span className="font-medium text-foreground">
                        {m.author.firstName} {m.author.lastName}
                      </span>
                      {m.isInternal && (
                        <Badge variant="outline" className="text-[10px]">
                          {t("internalNote")}
                        </Badge>
                      )}
                      <span>{formatDateTime(m.createdAt)}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{m.body}</p>
                  </li>
                ))}
              </ul>
              {canWrite && (
                <div className="space-y-2 border-t pt-4">
                  <Textarea
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    placeholder={t("postMessage")}
                    rows={3}
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={messageInternal}
                      onCheckedChange={(v) => setMessageInternal(v === true)}
                    />
                    {t("internalNote")}
                  </label>
                  <Button size="sm" onClick={postMessage}>
                    {t("postMessage")}
                  </Button>
                </div>
              )}
            </div>
          )}

          {section === "team" && (
            <div className="space-y-4">
              <ul className="space-y-2">
                {project.members.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {m.user.firstName} {m.user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {m.user.email} · {m.user.role} · {m.access}
                      </p>
                    </div>
                    {canWrite && m.user.id !== project.createdBy.id && (
                      <Button variant="outline" size="sm" onClick={() => removeMember(m.id)}>
                        {locale === "sq" ? "Hiq" : "Remove"}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
              {canWrite && (
                <div className="space-y-2 border-t pt-4">
                  <p className="text-sm font-medium">{t("addMember")}</p>
                  <Input
                    placeholder={locale === "sq" ? "ID stafi (cuid)" : "Staff user ID (cuid)"}
                    value={newMemberId}
                    onChange={(e) => setNewMemberId(e.target.value)}
                  />
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                    value={newMemberAccess}
                    onChange={(e) => setNewMemberAccess(e.target.value as ProjectAccess)}
                  >
                    {PROJECT_ACCESS_LEVELS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                  <Button size="sm" onClick={addMember}>
                    {t("addMember")}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
