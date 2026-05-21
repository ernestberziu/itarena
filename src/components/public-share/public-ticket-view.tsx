"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Clock, GitBranch, History, Loader2, MessageSquare, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatDateTime } from "@/lib/utils";
import { RelativeTime } from "@/components/shared/relative-time";
import { DIVISION_LABELS } from "@/lib/sla";
import { TicketStatusBadge } from "@/components/portal/ticket-status-badge";
import { PriorityBadge } from "@/components/portal/priority-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatClientStatusHistory,
  mergeTicketActivity,
  type TicketHistoryRow,
} from "@/lib/ticket-activity";
import { resolveCommentAuthor } from "@/lib/public-share/guest-author";
import { PORTAL_BRAND_NAME, portalAuthorDisplayName, isPortalStaffRole } from "@/lib/portal/client-branding";
import type { Priority, Role, TicketStatus } from "@/types/domain";

export type PublicTicketPayload = {
  id: string;
  number: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  division: string;
  createdAt: string;
  updatedAt: string;
  createdBy: { firstName: string; lastName: string; role: Role };
  company: { name: string } | null;
  comments: Array<{
    id: string;
    body: string;
    isInternal: boolean;
    createdAt: string;
    guestAuthorName: string | null;
    author: { id: string; firstName: string; lastName: string; role: Role } | null;
  }>;
  history: TicketHistoryRow[];
  canComment: boolean;
};

export function PublicTicketView({
  token,
  clientName,
  locale,
  ticket: initial,
}: {
  token: string;
  clientName: string;
  locale: string;
  ticket: PublicTicketPayload;
}) {
  const router = useRouter();
  const t = useTranslations("publicShare");
  const lang = locale === "en" ? "en" : "sq";
  const [ticket, setTicket] = useState(initial);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const divLabel = DIVISION_LABELS[ticket.division]?.[lang] ?? ticket.division;
  const openedBy = isPortalStaffRole(ticket.createdBy.role)
    ? PORTAL_BRAND_NAME
    : `${ticket.createdBy.firstName} ${ticket.createdBy.lastName}`.trim();

  const activity = mergeTicketActivity(
    ticket.comments.map((c) => ({
      id: c.id,
      body: c.body,
      isInternal: c.isInternal,
      createdAt: new Date(c.createdAt),
      guestAuthorName: c.guestAuthorName,
      author: c.author,
    })),
    ticket.history.map((h) => ({ ...h, createdAt: new Date(h.createdAt) }))
  );

  async function refreshTicket() {
    const res = await fetch(`/api/public/share/ticket/${token}`);
    if (!res.ok) return;
    const data = (await res.json()) as { ticket: PublicTicketPayload };
    setTicket({
      ...data.ticket,
      createdAt: data.ticket.createdAt,
      updatedAt: data.ticket.updatedAt,
      comments: data.ticket.comments.map((c) => ({
        ...c,
        createdAt: c.createdAt,
      })),
      history: data.ticket.history,
    });
  }

  async function submitComment() {
    if (!comment.trim() || !ticket.canComment) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/public/share/ticket/${token}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: comment.trim() }),
      });
      if (!res.ok) throw new Error();
      setComment("");
      toast.success(t("commentSent"));
      await refreshTicket();
      router.refresh();
    } catch {
      toast.error(t("errors.generic"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10 pb-16">
      <p className="text-sm text-muted-foreground">
        {t("viewingAs", { name: clientName })}
      </p>

      <div className="space-y-3 border-b border-border/60 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-muted/80 px-2 py-0.5 font-mono text-xs text-muted-foreground ring-1 ring-border/60">
            {ticket.number}
          </span>
          <TicketStatusBadge status={ticket.status} locale={locale} />
          <PriorityBadge priority={ticket.priority} locale={locale} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{ticket.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            {openedBy}
          </span>
          <span>{divLabel}</span>
          {ticket.company && <span>{ticket.company.name}</span>}
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {formatDateTime(ticket.createdAt)}
          </span>
        </div>
      </div>

      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("description")}
        </h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{ticket.description}</p>
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <History className="h-4 w-4 text-muted-foreground" />
          {t("activity")}
        </h2>
        {activity.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-xl">
            {t("noActivity")}
          </p>
        ) : (
          <ul className="relative space-y-2 before:absolute before:bottom-2 before:left-[13px] before:top-2 before:w-px before:bg-border/80">
            {activity.map((item) => {
              if (item.kind === "comment") {
                const c = item.comment;
                const meta = resolveCommentAuthor(c.author, c.guestAuthorName, lang);
                const staffLabel =
                  c.author && isPortalStaffRole(c.author.role)
                    ? portalAuthorDisplayName(c.author, undefined, lang)
                    : null;
                return (
                  <li key={item.id} className="relative flex gap-2.5 pl-1">
                    <span className="relative z-[1] mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background text-[10px] font-semibold shadow-sm">
                      {meta.initials}
                    </span>
                    <div className="min-w-0 flex-1 rounded-lg border border-border/60 bg-card px-3 py-2 shadow-sm">
                      <div className="mb-1 flex justify-between gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {staffLabel ?? meta.displayName}
                        </span>
                        <time dateTime={item.createdAt.toISOString()}>
                          <RelativeTime date={c.createdAt} />
                        </time>
                      </div>
                      <p className="whitespace-pre-wrap text-sm">{c.body}</p>
                    </div>
                  </li>
                );
              }
              const h = item.history;
              return (
                <li key={item.id} className="relative flex gap-2.5 pl-1">
                  <span className="relative z-[1] mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-muted/50">
                    <GitBranch className="h-3 w-3 text-muted-foreground" />
                  </span>
                  <div className="min-w-0 flex-1 rounded-lg border border-border/50 bg-muted/15 px-3 py-2">
                    <time className="text-xs text-muted-foreground">
                      <RelativeTime date={h.createdAt} />
                    </time>
                    <p className="text-sm mt-1">{formatClientStatusHistory(h, locale)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {ticket.canComment && (
        <Card>
          <CardHeader className="border-b pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <MessageSquare className="h-4 w-4" />
              {t("addComment")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder={t("commentPlaceholder")}
            />
            <Button disabled={submitting || !comment.trim()} onClick={() => void submitComment()}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {t("sendComment")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
