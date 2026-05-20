"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TicketStatusBadge } from "@/components/portal/ticket-status-badge";
import type { TicketStatus } from "@/types/domain";
import { cn, timeAgo } from "@/lib/utils";
import { projectStatusBadgeClass, projectStatusLabel } from "@/lib/projects/status-ui";
import {
  ProjectForm,
  ProjectFormCard,
  type ProjectFormPayload,
} from "@/components/admin/projects/project-form";
import { ProjectChannelPanel } from "@/components/admin/messages/project-channel-panel";
import { ProjectStepsSection } from "@/components/admin/projects/project-steps-section";
import type { ProjectStepRow } from "@/lib/projects/step-types";

type Section = "overview" | "clients" | "tickets" | "messages" | "team" | "steps";

type TicketRow = {
  id: string;
  number: string;
  title: string;
  status: string;
  priority: string;
  updatedAt: string;
};

const SECTIONS: Section[] = ["overview", "clients", "tickets", "messages", "team", "steps"];

export function ProjectWorkspace({
  project: initial,
  tickets: initialTickets,
  steps: initialSteps,
  locale,
  listPrefix,
  canWrite,
  canMessageWrite,
  currentUserId,
  messageCount,
}: {
  project: ProjectFormPayload;
  tickets: TicketRow[];
  steps: ProjectStepRow[];
  locale: string;
  listPrefix: string;
  canWrite: boolean;
  canMessageWrite: boolean;
  currentUserId: string;
  messageCount?: number;
}) {
  const t = useTranslations("admin.projectsPage");
  const en = locale === "en";
  const [section, setSection] = useState<Section>("overview");
  const [project, setProject] = useState(initial);

  const sectionCounts: Record<Section, number | undefined> = {
    overview: undefined,
    clients: project.clients.length,
    tickets: initialTickets.length,
    messages: messageCount,
    team: project.members.length,
    steps: initialSteps.length,
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={project.title}
        description={`${project.createdBy.firstName} ${project.createdBy.lastName} · ${timeAgo(new Date(project.updatedAt))}`}
        toolbar={
          <Button variant="outline" size="sm" asChild>
            <Link href={`${listPrefix}/admin/projects`}>
              {en ? "← Projects" : "← Projektet"}
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2 -mt-2">
        <Badge
          variant="outline"
          className={cn("text-[10px] font-medium", projectStatusBadgeClass(project.status))}
        >
          {projectStatusLabel(project.status, locale)}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex flex-row gap-1 overflow-x-auto rounded-2xl border border-border/60 bg-card p-2 shadow-sm lg:flex-col lg:overflow-visible">
          {SECTIONS.map((s) => {
            const count = sectionCounts[s];
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSection(s)}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors whitespace-nowrap lg:w-full",
                  section === s
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <span>{t(`sections.${s}`)}</span>
                {count !== undefined && count > 0 ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                      section === s ? "bg-primary-foreground/20" : "bg-muted"
                    )}
                  >
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="min-w-0">
          {(section === "overview" || section === "team" || section === "clients") && (
            <ProjectForm
              mode="edit"
              locale={locale}
              listPrefix={listPrefix}
              canWrite={canWrite}
              project={project}
              activeSection={section}
              onProjectUpdate={(patch) => setProject((p) => ({ ...p, ...patch }))}
            />
          )}

          {section === "tickets" && (
            <ProjectFormCard title={t("sections.tickets")}>
              <div className="space-y-2">
                <Button size="sm" asChild>
                  <Link href={`${listPrefix}/admin/tickets?projectId=${project.id}`}>
                    {t("addTicket")}
                  </Link>
                </Button>
                <ul className="divide-y divide-border/60 rounded-xl border border-border/60 overflow-hidden">
                  {initialTickets.map((ticket) => (
                    <li key={ticket.id}>
                      <Link
                        href={`${listPrefix}/admin/tickets/${ticket.id}`}
                        className="flex items-center gap-3 px-3 py-3 hover:bg-muted/30 transition-colors"
                      >
                        <span className="font-mono text-xs text-muted-foreground shrink-0">
                          {ticket.number}
                        </span>
                        <span className="flex-1 truncate text-sm font-medium">{ticket.title}</span>
                        <TicketStatusBadge
                          status={ticket.status as TicketStatus}
                          locale={locale}
                          className="shrink-0"
                        />
                      </Link>
                    </li>
                  ))}
                  {initialTickets.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">{t("noTickets")}</p>
                  )}
                </ul>
              </div>
            </ProjectFormCard>
          )}

          {section === "messages" && (
            <ProjectFormCard title={t("sections.messages")} flush>
              <ProjectChannelPanel
                projectId={project.id}
                currentUserId={currentUserId}
                canWrite={canMessageWrite}
              />
            </ProjectFormCard>
          )}

          {section === "steps" && (
            <ProjectStepsSection
              projectId={project.id}
              locale={locale}
              initialSteps={initialSteps}
              canWrite={canWrite}
            />
          )}
        </div>
      </div>
    </div>
  );
}
