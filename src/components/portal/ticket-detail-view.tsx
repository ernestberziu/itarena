"use client";
import { useUiT } from "@/hooks/use-ui-t";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { formatDateTime, timeAgo, cn } from "@/lib/utils";
import { DIVISION_LABELS } from "@/lib/sla";
import { TicketStatusBadge } from "./ticket-status-badge";
import { PriorityBadge } from "./priority-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ArrowLeft,
  ChevronRight,
  GitBranch,
  History,
  MessageSquare,
  Lock,
  User,
  Clock,
  Loader2,
  Star,
  Pause,
  Play,
  Users,
  CircleHelp,
} from "lucide-react";
import { STAFF_ROLES, type Role, type TicketStatus } from "@/types/domain";
import {
  formatHistoryActivity,
  formatClientStatusHistory,
  mergeTicketActivity,
  type TicketHistoryRow,
} from "@/lib/ticket-activity";
import {
  PORTAL_BRAND_NAME,
  portalAuthorDisplayName,
  portalAuthorInitials,
  portalTicketOpenedByLabel,
  isPortalStaffRole,
} from "@/lib/portal/client-branding";
import { resolveCommentAuthor } from "@/lib/public-share/guest-author";

export type PortalTicketEngineerOption = {
  id: string;
  firstName: string;
  lastName: string;
};

interface TicketDetailViewProps {
  ticket: {
    id: string;
    number: string;
    title: string;
    description: string;
    status: TicketStatus;
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    division: string;
    slaDeadline: Date | null;
    resolvedAt: Date | null;
    closedAt: Date | null;
    rating: number | null;
    estimatedHours: number | null;
    estimatedDays: number | null;
    externalRequesterName: string | null;
    createdAt: Date;
    updatedAt: Date;
    createdBy: { id: string; firstName: string; lastName: string; email: string | null; role: Role };
    assignedTo: { id: string; firstName: string; lastName: string } | null;
    company: { name: string } | null;
    comments: Array<{
      id: string;
      body: string;
      isInternal: boolean;
      attachments: string;
      createdAt: Date;
      guestAuthorName?: string | null;
      author: { id: string; firstName: string; lastName: string; role: Role } | null;
    }>;
    history: TicketHistoryRow[];
  };
  currentUserId: string;
  currentUserRole: Role;
  locale: string;
  engineers?: PortalTicketEngineerOption[];
  ticketsListHref?: string;
  readOnlyForViewer?: boolean;
}

export function TicketDetailView({
  ticket,
  currentUserId,
  currentUserRole,
  locale,
  engineers,
  ticketsListHref,
  readOnlyForViewer = false,
}: TicketDetailViewProps) {
  const router = useRouter();
  const lp = locale === "sq" ? "" : `/${locale}`;
  const backHref = ticketsListHref ?? `${lp}/portal/tickets`;
  const isStaff = STAFF_ROLES.includes(currentUserRole);
  const isOwner = ticket.createdBy.id === currentUserId;
  const canOwnerActions = isOwner && !readOnlyForViewer;
  const canComment = isStaff || ticket.status !== "CLOSED";

  const tUi = useUiT();

  const engineerById = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of engineers ?? []) {
      m.set(e.id, `${e.firstName} ${e.lastName}`.trim());
    }
    if (ticket.assignedTo) {
      m.set(
        ticket.assignedTo.id,
        `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`.trim()
      );
    }
    return m;
  }, [engineers, ticket.assignedTo]);

  const [comment, setComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(ticket.rating ?? 0);

  const divLabel =
    DIVISION_LABELS[ticket.division]?.[locale as "sq" | "en"] ?? ticket.division;

  const creatorIsClientFacing =
    ticket.createdBy.role === "CLIENT" || ticket.createdBy.role === "COMPANY_ADMIN";

  const reporterMeta = (() => {
    const lang = locale === "en" ? "en" : "sq";
    if (creatorIsClientFacing) {
      return {
        primary: portalTicketOpenedByLabel(ticket.createdBy, lang),
        secondary: null as string | null,
      };
    }
    if (!isStaff && isPortalStaffRole(ticket.createdBy.role)) {
      return {
        primary: PORTAL_BRAND_NAME,
        secondary: null as string | null,
      };
    }
    if (ticket.externalRequesterName) {
      return {
        primary:
          locale === "sq"
            ? `Kërkues (jo-portal): ${ticket.externalRequesterName}`
            : `Requester (external): ${ticket.externalRequesterName}`,
        secondary: isStaff
          ? `${ticket.createdBy.firstName} ${ticket.createdBy.lastName}`
          : null,
      };
    }
    return {
      primary: isStaff
        ? `${ticket.createdBy.firstName} ${ticket.createdBy.lastName}`
        : PORTAL_BRAND_NAME,
      secondary: isStaff ? (locale === "sq" ? "Hapur nga stafi" : "Opened by staff") : null,
    };
  })();

  const visibleComments = isStaff
    ? ticket.comments
    : ticket.comments.filter((c) => !c.isInternal);

  const activity = useMemo(
    () => mergeTicketActivity(visibleComments, ticket.history),
    [visibleComments, ticket.history]
  );

  async function submitComment() {
    if (!comment.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/tickets/${ticket.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: comment, isInternal: isStaff ? isInternal : false }),
    });
    setSubmitting(false);
    if (!res.ok) {
      toast.error(tUi("error_submitting_comment"));
      return;
    }
    setComment("");
    if (isStaff) setIsInternal(false);
    toast.success(tUi("comment_added"));
    router.refresh();
  }

  async function updateStatus(status: TicketStatus) {
    const res = await fetch(`/api/tickets/${ticket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      toast.error(tUi("error"));
      return;
    }
    toast.success(tUi("status_updated"));
    router.refresh();
  }

  async function submitRating(stars: number) {
    setRating(stars);
    await fetch(`/api/tickets/${ticket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: stars }),
    });
    toast.success(tUi("thank_you_for_your_rating"));
    router.refresh();
  }

  const showStaffActions = isStaff;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href={backHref} className="transition-colors hover:text-foreground">
          {tUi("tickets")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
        <span className="font-mono text-foreground/80">{ticket.number}</span>
      </nav>

      <div className="flex flex-col gap-4 border-b border-border/60 pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-muted/80 px-2 py-0.5 font-mono text-xs text-muted-foreground ring-1 ring-border/60">
              {ticket.number}
            </span>
            <TicketStatusBadge status={ticket.status} locale={locale} />
            <PriorityBadge priority={ticket.priority} locale={locale} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{ticket.title}</h1>
          <div className="flex flex-col gap-0 divide-y divide-border/60 text-sm text-muted-foreground sm:flex-row sm:flex-nowrap sm:items-stretch sm:divide-x sm:divide-y-0 sm:overflow-x-auto">
            <div className="flex min-w-0 items-start gap-2 py-2 first:pt-0 sm:shrink-0 sm:py-0 sm:pr-4">
              <User className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <div className="min-w-0 leading-snug">
                <span className="block text-foreground/90">{reporterMeta.primary}</span>
                {reporterMeta.secondary ? (
                  <span className="mt-0.5 block text-xs">({reporterMeta.secondary})</span>
                ) : null}
              </div>
            </div>
            <div className="flex items-center py-2 sm:px-4 sm:py-0">
              <span>{divLabel}</span>
            </div>
            {isStaff && ticket.assignedTo ? (
              <div className="flex items-center py-2 sm:px-4 sm:py-0">
                <span>
                  {tUi("engineer")}: {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}
                </span>
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-x-1.5 py-2 last:pb-0 sm:px-4 sm:py-0">
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="tabular-nums text-foreground/90">{formatDateTime(ticket.createdAt)}</span>
              <span className="text-xs">({timeAgo(ticket.createdAt)})</span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild className="shrink-0 border-border/60 shadow-sm">
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {tUi("back")}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="admin-card-elevated rounded-2xl border p-6 shadow-sm border-[var(--admin-card-border)]">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {tUi("description")}
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/95">{ticket.description}</p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <History className="h-4 w-4 text-muted-foreground" />
                {tUi("activity")}
              </h2>
              <span className="text-xs text-muted-foreground">
                {activity.length} {tUi("events")}
              </span>
            </div>

            {activity.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
                {tUi("no_activity_yet")}
              </div>
            ) : (
              <ul className="relative space-y-2 before:absolute before:bottom-2 before:left-[13px] before:top-2 before:w-px before:bg-border/80">
                {activity.map((item) => {
                  if (item.kind === "comment") {
                    const c = item.comment;
                    const lang = locale === "en" ? "en" : "sq";
                    const guestMeta = resolveCommentAuthor(
                      c.author,
                      c.guestAuthorName,
                      lang
                    );
                    const isStaffComment =
                      c.author != null && STAFF_ROLES.includes(c.author.role);
                    const authorLabel = isStaff
                      ? c.author
                        ? `${c.author.firstName} ${c.author.lastName}`
                        : guestMeta.displayName
                      : c.author
                        ? portalAuthorDisplayName(c.author, currentUserId, lang)
                        : guestMeta.displayName;
                    const authorInitials = isStaff
                      ? c.author
                        ? `${c.author.firstName[0]}${c.author.lastName[0]}`
                        : guestMeta.initials
                      : c.author
                        ? portalAuthorInitials(c.author, currentUserId)
                        : guestMeta.initials;
                    return (
                      <li key={item.id} className="relative flex gap-2.5 pl-1">
                        <span className="relative z-[1] mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background text-[10px] font-semibold text-muted-foreground shadow-sm">
                          {authorInitials}
                        </span>
                        <div
                          className={cn(
                            "min-w-0 flex-1 rounded-lg border px-3 py-2 shadow-sm",
                            c.isInternal
                              ? "border-amber-500/35 bg-amber-500/10"
                              : isStaffComment
                                ? "border-primary/25 bg-primary/5"
                                : "border-border/60 bg-card"
                          )}
                        >
                          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-xs font-medium">
                                {authorLabel}
                              </span>
                              {c.isInternal ? (
                                <span className="inline-flex items-center gap-1 rounded-md border border-amber-600/25 bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase">
                                  <Lock className="h-3 w-3" />
                                  Internal
                                </span>
                              ) : isStaff && isStaffComment ? (
                                <span className="inline-flex items-center gap-1 rounded-md border border-sky-600/25 bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-medium uppercase">
                                  <Users className="h-3 w-3" />
                                  External
                                </span>
                              ) : null}
                            </div>
                            <time className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</time>
                          </div>
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{c.body}</p>
                        </div>
                      </li>
                    );
                  }

                  const h = item.history;
                  return (
                    <li key={item.id} className="relative flex gap-2.5 pl-1">
                      <span className="relative z-[1] mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/50 shadow-sm">
                        <GitBranch className="h-3 w-3 text-muted-foreground" />
                      </span>
                      <div className="min-w-0 flex-1 rounded-lg border border-border/50 bg-muted/15 px-3 py-2">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="rounded bg-muted/80 px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                            {tUi("status")}
                          </span>
                          <time className="text-xs text-muted-foreground">{timeAgo(h.createdAt)}</time>
                        </div>
                        <p className="text-sm leading-snug text-foreground/90">
                          {isStaff
                            ? formatHistoryActivity(h, locale, engineerById)
                            : formatClientStatusHistory(h, locale)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {canComment ? (
            <Card className="admin-card-elevated">
              <CardHeader className="border-b pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <MessageSquare className="h-4 w-4" />
                  {tUi("add_comment")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {isStaff ? (
                  <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {tUi("visibility")}
                    </span>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="comment-internal"
                        checked={isInternal}
                        onCheckedChange={(v) => setIsInternal(v === true)}
                      />
                      <Label htmlFor="comment-internal" className="cursor-pointer text-xs">
                        Internal
                      </Label>
                    </div>
                  </div>
                ) : null}
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder={tUi("write_your_comment")}
                />
                <Button onClick={() => void submitComment()} disabled={submitting || !comment.trim()}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {tUi("submit")}
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {ticket.status === "RESOLVED" && canOwnerActions ? (
            <Card className="admin-card-elevated">
              <CardContent className="p-4">
                <p className="mb-3 text-sm font-medium">{tUi("rate_the_service")}</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => void submitRating(star)} className="transition-transform hover:scale-110">
                      <Star
                        className={cn(
                          "h-7 w-7",
                          star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-4">
          {showStaffActions ? (
            <Card className="admin-card-elevated">
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-sm">{tUi("actions")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-4">
                {ticket.status === "OPEN" ? (
                  <Button size="sm" className="w-full" onClick={() => void updateStatus("IN_PROGRESS")}>
                    {tUi("start_working")}
                  </Button>
                ) : null}
                {ticket.status === "IN_PROGRESS" ? (
                  <>
                    <Button size="sm" className="w-full" onClick={() => void updateStatus("RESOLVED")}>
                      {tUi("mark_resolved")}
                    </Button>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => void updateStatus("PENDING_CLIENT")}>
                      {tUi("pending_client")}
                    </Button>
                    <Button size="sm" variant="outline" className="w-full gap-2" onClick={() => void updateStatus("PAUSED")}>
                      <Pause className="h-4 w-4" />
                      {tUi("pause")}
                    </Button>
                  </>
                ) : null}
                {ticket.status === "PAUSED" ? (
                  <Button size="sm" className="w-full gap-2" onClick={() => void updateStatus("IN_PROGRESS")}>
                    <Play className="h-4 w-4" />
                    {tUi("resume_work")}
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          <Card className="admin-card-elevated">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-sm font-semibold">{tUi("details")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">{tUi("status")}</p>
                <TicketStatusBadge status={ticket.status} locale={locale} />
              </div>
              <Separator />
              <div>
                <p className="mb-1 text-xs text-muted-foreground">{tUi("priority")}</p>
                <PriorityBadge priority={ticket.priority} locale={locale} />
              </div>
              <Separator />
              <div>
                <p className="mb-1 text-xs text-muted-foreground">{tUi("division")}</p>
                <p className="text-sm">{divLabel}</p>
              </div>
              {ticket.company ? (
                <>
                  <Separator />
                  <div>
                    <p className="mb-1 text-xs text-muted-foreground">{tUi("company")}</p>
                    <p className="text-sm">{ticket.company.name}</p>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
