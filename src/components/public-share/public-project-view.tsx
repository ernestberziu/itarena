"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortalProjectStepsTimeline } from "@/components/portal/portal-project-steps";
import { projectStatusLabel } from "@/lib/projects/status-ui";
import { resolveCommentAuthor } from "@/lib/public-share/guest-author";
import { portalAuthorDisplayName, isPortalStaffRole } from "@/lib/portal/client-branding";
import { formatDateTime } from "@/lib/utils";
import type { ProjectStatus } from "@/lib/projects/types";
import type { Role } from "@/types/domain";

type MessageRow = {
  id: string;
  body: string;
  createdAt: string;
  guestAuthorName: string | null;
  author: { id: string; firstName: string; lastName: string; role: Role } | null;
};

export type PublicProjectPayload = {
  id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  updatedAt: string;
  steps: Array<{
    id: string;
    sortOrder: number;
    title: string;
    description: string | null;
    status: string;
  }>;
  messages: MessageRow[];
};

export function PublicProjectView({
  token,
  clientName,
  locale,
  project: initial,
}: {
  token: string;
  clientName: string;
  locale: string;
  project: PublicProjectPayload;
}) {
  const router = useRouter();
  const t = useTranslations("publicShare");
  const lang = locale === "en" ? "en" : "sq";
  const [project, setProject] = useState(initial);
  const [messages, setMessages] = useState(initial.messages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const refreshMessages = useCallback(async () => {
    const res = await fetch(`/api/public/share/project/${token}/messages`);
    if (!res.ok) return;
    const data = (await res.json()) as MessageRow[];
    setMessages(data);
  }, [token]);

  useEffect(() => {
    setProject(initial);
    setMessages(initial.messages);
  }, [initial]);

  async function sendMessage() {
    if (!body.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/public/share/project/${token}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });
      if (!res.ok) throw new Error();
      setBody("");
      toast.success(t("messageSent"));
      await refreshMessages();
      router.refresh();
    } catch {
      toast.error(t("errors.generic"));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10 pb-16">
      <p className="text-sm text-muted-foreground">{t("viewingAs", { name: clientName })}</p>

      <div className="space-y-2 border-b border-border/60 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
          <Badge variant="secondary">{projectStatusLabel(project.status, locale)}</Badge>
        </div>
        {project.description && (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.description}</p>
        )}
      </div>

      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-sm font-semibold">{t("projectSteps")}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <PortalProjectStepsTimeline steps={project.steps} locale={locale} />
          {project.steps.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">{t("noSteps")}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-sm font-semibold">{t("messages")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[min(420px,50vh)] divide-y divide-border/60 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">{t("noMessages")}</p>
            ) : (
              messages.map((msg) => {
                const meta = resolveCommentAuthor(msg.author, msg.guestAuthorName, lang);
                const label =
                  msg.author && isPortalStaffRole(msg.author.role)
                    ? portalAuthorDisplayName(msg.author, undefined, lang)
                    : meta.displayName;
                return (
                  <div key={msg.id} className="space-y-1 px-5 py-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      {label} · {formatDateTime(msg.createdAt)}
                    </p>
                    <p className="whitespace-pre-wrap text-sm">{msg.body}</p>
                  </div>
                );
              })
            )}
          </div>
          <div className="space-y-3 border-t border-border/60 bg-muted/15 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              {t("writeMessage")}
            </div>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder={t("messagePlaceholder")}
            />
            <Button size="sm" disabled={sending || !body.trim()} onClick={() => void sendMessage()}>
              {sending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {t("sendMessage")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
