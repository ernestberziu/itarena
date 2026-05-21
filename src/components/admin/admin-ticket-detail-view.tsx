"use client";
import { useUiT } from "@/hooks/use-ui-t";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronRight,
  GitBranch,
  History,
  Loader2,
  Lock,
  MessageSquare,
  Play,
  User,
  UserCheck,
  Clock,
  CheckCircle2,
  CircleDot,
  XCircle,
  Pause,
  Users,
  CircleHelp,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { RelativeTimeInParentheses, TimeAgoStamp } from "@/components/shared/relative-time";
import { DIVISION_LABELS } from "@/lib/sla";
import {
  mergeTicketActivity,
  formatHistoryActivity,
  isClientVisibleTicketHistoryRow,
  type TicketCommentRow,
  type TicketHistoryRow,
} from "@/lib/ticket-activity";
import { TicketStatusBadge } from "@/components/portal/ticket-status-badge";
import { PriorityBadge } from "@/components/portal/priority-badge";
import { SlaIndicator } from "@/components/portal/sla-indicator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { STAFF_ROLES, type Role, type TicketStatus } from "@/types/domain";
import type { Priority } from "@/types/domain";
import {
  AdminTicketOpsForm,
  type EngineerOption,
  type ProjectOption,
} from "@/components/admin/admin-ticket-ops-form";
import { AdminTicketOpsSheet } from "@/components/admin/admin-ticket-ops-sheet";
import { PublicSharePanel } from "@/components/admin/public-share/public-share-panel";
import { resolveCommentAuthor } from "@/lib/public-share/guest-author";

export type AdminTicketDetailModel = {
  id: string;
  number: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
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
  assignedToId: string | null;
  projectId: string | null;
  project: { id: string; title: string; slug: string } | null;
  company: { name: string } | null;
  comments: TicketCommentRow[];
  history: TicketHistoryRow[];
};

const ALL_STATUSES: TicketStatus[] = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "PAUSED",
  "PENDING_CLIENT",
  "RESOLVED",
  "CLOSED",
];

export function AdminTicketDetailView({
  ticket,
  currentUserRole,
  locale,
  engineers,
  projects,
  ticketsListHref,
  canWriteShares = false,
}: {
  ticket: AdminTicketDetailModel;
  currentUserRole: Role;
  locale: string;
  engineers: EngineerOption[];
  projects: ProjectOption[];
  ticketsListHref: string;
  canWriteShares?: boolean;
}) {
  const router = useRouter();
  const isStaff = STAFF_ROLES.includes(currentUserRole);
  const lang = locale === "en" ? "en" : "sq";
  const lp = locale === "sq" ? "" : `/${locale}`;

  const [comment, setComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);

  const divLabel =
    DIVISION_LABELS[ticket.division]?.[locale as "sq" | "en"] ?? ticket.division;

  const estimateLabel = (() => {
    const d = ticket.estimatedDays ?? 0;
    const h = ticket.estimatedHours ?? 0;
    if (d <= 0 && h <= 0) return null;
    const parts: string[] = [];
    if (d > 0) parts.push(locale === "sq" ? `${d} ditë` : `${d} d`);
    if (h > 0) parts.push(`${h} h`);
    return parts.join(" · ");
  })();

  const creatorIsClientFacing =
    ticket.createdBy.role === "CLIENT" || ticket.createdBy.role === "COMPANY_ADMIN";

  const reporterMeta = (() => {
    if (creatorIsClientFacing) {
      return {
        primary: `${ticket.createdBy.firstName} ${ticket.createdBy.lastName}`,
        secondary: null as string | null,
      };
    }
    if (ticket.externalRequesterName) {
      return {
        primary:
          locale === "sq"
            ? `Kërkues (jo-portal): ${ticket.externalRequesterName}`
            : `Requester (external): ${ticket.externalRequesterName}`,
        secondary: null,
      };
    }
    return {
      primary: `${ticket.createdBy.firstName} ${ticket.createdBy.lastName}`,
      secondary: locale === "sq" ? "Hapur nga stafi" : "Opened by staff",
    };
  })();

  const visibleComments = ticket.comments;

  const engineerById = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of engineers) {
      m.set(e.id, `${e.firstName} ${e.lastName}`.trim());
    }
    return m;
  }, [engineers]);

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
      body: JSON.stringify({
        body: comment,
        isInternal:
          ticket.status === "CLOSED" ? true : isStaff ? isInternal : false,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      toast.error(locale === "sq" ? "Gabim gjatë dërgimit" : "Error submitting comment");
      return;
    }
    setComment("");
    if (ticket.status !== "CLOSED") setIsInternal(false);
    toast.success(locale === "sq" ? "Komenti u shtua" : "Comment added");
    router.refresh();
  }

  async function updateStatus(next: TicketStatus) {
    if (next === "CLOSED") {
      setCloseConfirmOpen(true);
      return;
    }
    await applyStatus(next);
  }

  async function applyStatus(next: TicketStatus) {
    setStatusSaving(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        toast.error(locale === "sq" ? "Gabim" : "Error");
        return;
      }
      toast.success(locale === "sq" ? "Statusi u përditësua" : "Status updated");
      setCloseConfirmOpen(false);
      router.refresh();
    } finally {
      setStatusSaving(false);
    }
  }

  const tUi = useUiT();

  const statusLabels: Record<TicketStatus, { sq: string; en: string }> = {
    OPEN: { sq: "Hapur", en: "Open" },
    ASSIGNED: { sq: "Caktuar", en: "Assigned" },
    IN_PROGRESS: { sq: "Në Progres", en: "In Progress" },
    PAUSED: { sq: "Në pauzë", en: "Paused" },
    PENDING_CLIENT: { sq: "Pret Klientin", en: "Pending Client" },
    RESOLVED: { sq: "Zgjidhur", en: "Resolved" },
    CLOSED: { sq: "Mbyllur", en: "Closed" },
  };

  const statusTriggerLabel =
    statusLabels[ticket.status]?.[lang] ?? ticket.status;

  const showComposer =
    ticket.status !== "CLOSED" || (isStaff && ticket.status === "CLOSED");

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href={ticketsListHref} className="hover:text-foreground transition-colors">
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
            {ticket.slaDeadline && (
              <SlaIndicator
                createdAt={new Date(ticket.createdAt)}
                deadline={new Date(ticket.slaDeadline)}
                status={ticket.status}
                resolvedAt={ticket.resolvedAt ? new Date(ticket.resolvedAt) : null}
                locale={locale}
              />
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {ticket.title}
          </h1>
          <div className="flex flex-col gap-0 divide-y divide-border/60 text-sm text-muted-foreground sm:flex-row sm:flex-nowrap sm:items-stretch sm:divide-x sm:divide-y-0 sm:divide-border/60 sm:overflow-x-auto">
            <div className="flex min-w-0 items-start gap-2 py-2 first:pt-0 sm:shrink-0 sm:py-0 sm:pr-4">
              <User className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0 leading-snug">
                <span className="block text-foreground/90">{reporterMeta.primary}</span>
                {reporterMeta.secondary && (
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    ({reporterMeta.secondary})
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center py-2 sm:px-4 sm:py-0">
              <span className="leading-none">{divLabel}</span>
            </div>
            {ticket.project && (
              <div className="flex items-center py-2 sm:px-4 sm:py-0">
                <span className="leading-none">
                  <span className="text-muted-foreground">{tUi("project")}: </span>
                  <Link
                    href={`${lp}/admin/projects/${ticket.project.id}`}
                    className="font-medium text-foreground/90 hover:underline"
                  >
                    {ticket.project.title}
                  </Link>
                </span>
              </div>
            )}
            {ticket.assignedTo && !ticket.projectId && (
              <div className="flex items-center py-2 sm:px-4 sm:py-0">
                <span className="leading-none">
                  <span className="text-muted-foreground">{tUi("engineer")}: </span>
                  <span className="text-foreground/90">
                    {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}
                  </span>
                </span>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 py-2 last:pb-0 sm:px-4 sm:py-0">
              <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="tabular-nums text-foreground/90">{formatDateTime(ticket.createdAt)}</span>
              <span className="text-xs text-muted-foreground">
                <RelativeTimeInParentheses date={ticket.createdAt} />
              </span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:flex-col lg:items-end">
          <Button variant="outline" size="sm" asChild className="border-border/60 shadow-sm">
            <Link href={ticketsListHref}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {tUi("back")}
            </Link>
          </Button>
          <AdminTicketOpsSheet
            ticketId={ticket.id}
            locale={locale}
            engineers={engineers}
            projects={projects}
            assignedToId={ticket.assignedToId ?? null}
            projectId={ticket.projectId ?? null}
            priority={ticket.priority}
            estimatedDays={ticket.estimatedDays}
            estimatedHours={ticket.estimatedHours}
          />
        </div>
      </div>

      <PublicSharePanel
        resourceType="TICKET"
        resourceId={ticket.id}
        locale={locale}
        canWrite={canWriteShares}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="isolate space-y-6 lg:col-span-2">
          <section
            className={cn(
              "admin-card-elevated rounded-2xl border p-6 shadow-sm",
              "border-[var(--admin-card-border)]"
            )}
          >
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {tUi("description")}
            </h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/95">
              {ticket.description}
            </p>
          </section>

          <section className="relative z-0 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <History className="h-4 w-4 text-muted-foreground" />
                {tUi("activity")}
              </h2>
              <span className="text-xs text-muted-foreground">
                {activity.length}{" "}
                {locale === "sq" ? "ngjarje" : "events"}
              </span>
            </div>

            {activity.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
                {tUi("no_activity_yet")}
              </div>
            ) : (
              <ul className="relative space-y-2 before:absolute before:left-[13px] before:top-2 before:bottom-2 before:w-px before:bg-border/80">
                {activity.map((item) => {
                  if (item.kind === "comment") {
                    const c = item.comment;
                    const authorMeta = resolveCommentAuthor(
                      c.author,
                      c.guestAuthorName,
                      lang
                    );
                    const isStaffComment =
                      c.author != null && STAFF_ROLES.includes(c.author.role);
                    return (
                      <li key={item.id} className="relative flex gap-2.5 pl-1">
                        <span className="relative z-[1] mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background text-[10px] font-semibold text-muted-foreground shadow-sm">
                          {authorMeta.initials}
                        </span>
                        <div
                          className={cn(
                            "min-w-0 flex-1 rounded-lg border px-3 py-2 shadow-sm",
                            c.isInternal
                              ? "border-amber-500/35 bg-amber-500/10 dark:border-amber-500/30 dark:bg-amber-950/25"
                              : isStaffComment
                                ? "border-primary/25 bg-primary/5 dark:border-primary/30 dark:bg-primary/10"
                                : "border-border/60 bg-card"
                          )}
                        >
                          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-xs font-medium text-foreground">
                                {authorMeta.displayName}
                              </span>
                              {c.isInternal ? (
                                <span className="inline-flex items-center gap-1 rounded-md border border-amber-600/25 bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-900 dark:text-amber-100">
                                  <Lock className="h-3 w-3" />
                                  {tUi("internal")}
                                </span>
                              ) : isStaffComment ? (
                                <span className="inline-flex items-center gap-1 rounded-md border border-sky-600/25 bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-sky-900 dark:text-sky-100">
                                  <Users className="h-3 w-3" />
                                  {tUi("external")}
                                </span>
                              ) : null}
                              <span className="rounded bg-muted/80 px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                                {tUi("comment")}
                              </span>
                            </div>
                            <TimeAgoStamp date={c.createdAt} className="text-xs text-muted-foreground" />
                          </div>
                          <p className="text-xs leading-relaxed whitespace-pre-wrap text-foreground/95 sm:text-sm">
                            {c.body}
                          </p>
                        </div>
                      </li>
                    );
                  }

                  const h = item.history;
                  return (
                    <li key={item.id} className="relative flex gap-2.5 pl-1">
                      <span className="relative z-[1] mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/50 text-muted-foreground shadow-sm">
                        <GitBranch className="h-3 w-3" />
                      </span>
                      <div className="min-w-0 flex-1 rounded-lg border border-border/50 bg-muted/15 px-3 py-2 dark:bg-muted/20">
                        <div className="mb-1.5 flex flex-wrap items-center gap-2">
                          {!isClientVisibleTicketHistoryRow(h) ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-amber-600/25 bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-900 dark:text-amber-100">
                              <Lock className="h-3 w-3" />
                              {tUi("staff_only_2")}
                            </span>
                          ) : null}
                          <TimeAgoStamp
                            date={h.createdAt}
                            className="text-xs text-muted-foreground ml-auto"
                          />
                        </div>
                        <p className="text-xs leading-snug text-foreground/90 sm:text-sm">
                          {formatHistoryActivity(h, locale, engineerById)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {showComposer && (
            <section
              data-slot="admin-ticket-comment-composer"
              className={cn(
                "sticky bottom-4 rounded-xl border border-border/60 p-2.5 shadow-lg sm:p-3",
                "text-card-foreground ring-1 ring-border/80 dark:ring-border/60"
              )}
            >
              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  {ticket.status === "CLOSED"
                    ? tUi("internal_note_closed_ticket")
                    : tUi("add_comment")}
                </p>
                {isStaff && ticket.status !== "CLOSED" && (
                  <div
                    role="group"
                    aria-label={tUi("comment_visibility")}
                    className="flex min-w-0 w-full max-w-full flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md border border-border/60 bg-muted px-2 py-1.5 sm:max-w-none sm:gap-x-4 sm:py-1.5"
                  >
                    <div className="flex shrink-0 items-center gap-1">
                      <span className="text-[11px] font-medium tracking-tight text-muted-foreground">
                        {tUi("comment_visibility")}
                      </span>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <button
                              type="button"
                              className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                              aria-label={tUi("help_comment_visibility")}
                            >
                              <CircleHelp className="size-3.5" strokeWidth={2} />
                            </button>
                          }
                        />
                        <TooltipContent
                          side="bottom"
                          align="start"
                          sideOffset={8}
                          showArrow={false}
                          className={cn(
                            "ticket-comment-visibility-tooltip !block !w-max max-w-[min(22rem,calc(100vw-1.5rem))] rounded-xl border border-border bg-card px-3.5 py-3 text-left text-[13px] leading-snug text-card-foreground shadow-lg ring-1 ring-border"
                          )}
                        >
                          <p className="mb-2.5 border-b border-border/60 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {tUi("comment_visibility")}
                          </p>
                          <ul className="space-y-2.5">
                            <li className="flex gap-2.5">
                              <span className="mt-0.5 shrink-0 rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">
                                {tUi("internal")}
                              </span>
                              <span className="text-muted-foreground">
                                {tUi("staff_only_the_customer_does_not_see_it_in_the_p")}
                              </span>
                            </li>
                            <li className="flex gap-2.5">
                              <span className="mt-0.5 shrink-0 rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">
                                {tUi("external")}
                              </span>
                              <span className="text-muted-foreground">
                                {tUi("the_customer_sees_it_in_the_portal_as_a_public_r")}
                              </span>
                            </li>
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-1 sm:flex-none sm:justify-end">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="comment-vis-internal-admin"
                          checked={isInternal}
                          onCheckedChange={(v) => setIsInternal(v === true)}
                        />
                        <Label
                          htmlFor="comment-vis-internal-admin"
                          className="cursor-pointer text-xs font-medium text-foreground"
                        >
                          {tUi("internal")}
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="comment-vis-external-admin"
                          checked={!isInternal}
                          onCheckedChange={(v) => setIsInternal(v !== true)}
                        />
                        <Label
                          htmlFor="comment-vis-external-admin"
                          className="cursor-pointer text-xs font-medium text-foreground"
                        >
                          {tUi("external")}
                        </Label>
                      </div>
                    </div>
                  </div>
                )}
                {isStaff && ticket.status === "CLOSED" && (
                  <span className="text-xs text-amber-700 dark:text-amber-200/90">
                    {tUi("staff_only_3")}
                  </span>
                )}
              </div>
              <div
                className={cn(
                  "rounded-lg border border-input p-0.5 shadow-inner !bg-card dark:!bg-card",
                  isInternal &&
                    ticket.status !== "CLOSED" &&
                    "!border-amber-200 !bg-amber-50 dark:!border-amber-800 dark:!bg-amber-950",
                  !isInternal &&
                    isStaff &&
                    ticket.status !== "CLOSED" &&
                    "!border-sky-200 !bg-sky-50 dark:!border-sky-800 dark:!bg-sky-950"
                )}
              >
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  placeholder={
                    ticket.status === "CLOSED"
                      ? tUi("internal_audit_note")
                      : tUi("write_your_comment")
                  }
                  className={cn(
                    "min-h-[4.25rem] border-0 bg-transparent py-2 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring/40 dark:bg-transparent md:min-h-[3.75rem]"
                  )}
                />
              </div>
              {ticket.status === "CLOSED" && isStaff && (
                <input type="hidden" readOnly value="internal" aria-hidden />
              )}
              <div className="mt-2 flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  onClick={submitComment}
                  disabled={submitting || !comment.trim()}
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {tUi("submit")}
                </Button>
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <div
            className={cn(
              "rounded-2xl border border-border/60 bg-card p-5 shadow-sm",
              "dark:bg-card/80"
            )}
          >
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {tUi("quick_actions")}
            </h3>
            <div className="flex flex-col gap-2">
              {isStaff && (ticket.status === "OPEN" || ticket.status === "ASSIGNED") && (
                <Button
                  size="sm"
                  className="w-full justify-start gap-2"
                  disabled={statusSaving}
                  onClick={() => updateStatus("IN_PROGRESS")}
                >
                  <Play className="h-4 w-4" />
                  {tUi("start_working")}
                </Button>
              )}
              {isStaff && ticket.status === "IN_PROGRESS" && (
                <>
                  <Button
                    size="sm"
                    className="w-full justify-start gap-2"
                    disabled={statusSaving}
                    onClick={() => updateStatus("RESOLVED")}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {tUi("mark_resolved")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start gap-2 border-border/60"
                    disabled={statusSaving}
                    onClick={() => updateStatus("PENDING_CLIENT")}
                  >
                    <UserCheck className="h-4 w-4" />
                    {tUi("pending_client")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start gap-2 border-border/60"
                    disabled={statusSaving}
                    onClick={() => updateStatus("PAUSED")}
                  >
                    <Pause className="h-4 w-4" />
                    {tUi("pause")}
                  </Button>
                </>
              )}
              {isStaff && ticket.status === "PAUSED" && (
                <Button
                  size="sm"
                  className="w-full justify-start gap-2"
                  disabled={statusSaving}
                  onClick={() => updateStatus("IN_PROGRESS")}
                >
                  <Play className="h-4 w-4" />
                  {tUi("resume_work")}
                </Button>
              )}
              {isStaff && ticket.status === "PENDING_CLIENT" && (
                <Button
                  size="sm"
                  className="w-full justify-start gap-2"
                  disabled={statusSaving}
                  onClick={() => updateStatus("IN_PROGRESS")}
                >
                  <CircleDot className="h-4 w-4" />
                  {tUi("resume_work")}
                </Button>
              )}
              {ticket.status === "RESOLVED" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start gap-2"
                    disabled={statusSaving}
                    onClick={() => updateStatus("CLOSED")}
                  >
                    <XCircle className="h-4 w-4" />
                    {tUi("close_ticket")}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full justify-start gap-2"
                    disabled={statusSaving}
                    onClick={() => updateStatus("IN_PROGRESS")}
                  >
                    {tUi("reopen")}
                  </Button>
                </>
              )}
              {isStaff && ticket.status === "CLOSED" && (
                <Button
                  size="sm"
                  className="w-full justify-start gap-2"
                  disabled={statusSaving}
                  onClick={() => updateStatus("IN_PROGRESS")}
                >
                  <Play className="h-4 w-4" />
                  {tUi("reopen_ticket")}
                </Button>
              )}
            </div>

            {isStaff && (
              <>
                <Separator className="my-5" />
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {tUi("status")}
                </h3>
                <Select
                  value={ticket.status}
                  disabled={statusSaving}
                  onValueChange={(v) => {
                    if (!v || v === ticket.status) return;
                    if (v === "CLOSED") {
                      setCloseConfirmOpen(true);
                      return;
                    }
                    void applyStatus(v as TicketStatus);
                  }}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue>{statusTriggerLabel}</SelectValue>
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false} className="min-w-[var(--anchor-width)]">
                    {ALL_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {statusLabels[s][lang]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>

          <div className="hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm lg:block dark:bg-card/80">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {tUi("operations")}
            </h3>
            <AdminTicketOpsForm
              key={`${ticket.id}-${ticket.assignedToId ?? "x"}-${ticket.projectId ?? "np"}-${ticket.priority}-${ticket.estimatedDays ?? "n"}-${ticket.estimatedHours ?? "n"}-${ticket.slaDeadline?.toISOString() ?? ""}`}
              ticketId={ticket.id}
              locale={locale}
              engineers={engineers}
              projects={projects}
              assignedToId={ticket.assignedToId ?? null}
              projectId={ticket.projectId ?? null}
              priority={ticket.priority}
              estimatedDays={ticket.estimatedDays}
              estimatedHours={ticket.estimatedHours}
            />
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-5 text-sm shadow-sm dark:bg-card/80">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {tUi("details")}
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-muted-foreground">{tUi("status")}</dt>
                <dd className="mt-1">
                  <TicketStatusBadge status={ticket.status} locale={locale} />
                </dd>
              </div>
              <Separator />
              <div>
                <dt className="text-xs text-muted-foreground">{tUi("priority")}</dt>
                <dd className="mt-1">
                  <PriorityBadge priority={ticket.priority} locale={locale} />
                </dd>
              </div>
              <Separator />
              <div>
                <dt className="text-xs text-muted-foreground">{tUi("division")}</dt>
                <dd className="mt-1 font-medium text-foreground">{divLabel}</dd>
              </div>
              {ticket.project && (
                <>
                  <Separator />
                  <div>
                    <dt className="text-xs text-muted-foreground">{tUi("project")}</dt>
                    <dd className="mt-1">
                      <Link
                        href={`${lp}/admin/projects/${ticket.project.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {ticket.project.title}
                      </Link>
                    </dd>
                  </div>
                </>
              )}
              {ticket.slaDeadline && (
                <>
                  <Separator />
                  <div>
                    <dt className="text-xs text-muted-foreground">SLA</dt>
                    <dd className="mt-1 space-y-1">
                      <SlaIndicator
                        createdAt={new Date(ticket.createdAt)}
                        deadline={new Date(ticket.slaDeadline)}
                        status={ticket.status}
                        resolvedAt={ticket.resolvedAt ? new Date(ticket.resolvedAt) : null}
                        locale={locale}
                      />
                    </dd>
                  </div>
                </>
              )}
              {ticket.company && (
                <>
                  <Separator />
                  <div>
                    <dt className="text-xs text-muted-foreground">{tUi("company")}</dt>
                    <dd className="mt-1 font-medium">{ticket.company.name}</dd>
                  </div>
                </>
              )}
              {estimateLabel && (
                <>
                  <Separator />
                  <div>
                    <dt className="text-xs text-muted-foreground">{tUi("estimate")}</dt>
                    <dd className="mt-1 font-medium tabular-nums">{estimateLabel}</dd>
                  </div>
                </>
              )}
              <Separator />
              <div>
                <dt className="text-xs text-muted-foreground">{tUi("updated")}</dt>
                <dd className="mt-1 text-xs text-muted-foreground">{formatDateTime(ticket.updatedAt)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      <AlertDialog
        open={closeConfirmOpen}
        onOpenChange={setCloseConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tUi("close_ticket_2")}</AlertDialogTitle>
            <AlertDialogDescription>
              {tUi("the_ticket_will_be_marked_closed_the_client_cann")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tUi("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void applyStatus("CLOSED");
              }}
            >
              {tUi("close")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
