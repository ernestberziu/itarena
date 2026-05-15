"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { formatDateTime, timeAgo, cn } from "@/lib/utils";
import { DIVISION_LABELS } from "@/lib/sla";
import { TicketStatusBadge } from "./ticket-status-badge";
import { PriorityBadge } from "./priority-badge";
import { SlaIndicator } from "./sla-indicator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ArrowLeft,
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
    createdBy: { id: string; firstName: string; lastName: string; email: string; role: Role };
    assignedTo: { id: string; firstName: string; lastName: string } | null;
    company: { name: string } | null;
    comments: Array<{
      id: string;
      body: string;
      isInternal: boolean;
      attachments: string;
      createdAt: Date;
      author: { id: string; firstName: string; lastName: string; role: Role };
    }>;
    history: Array<{
      id: string;
      field: string;
      oldValue: string | null;
      newValue: string | null;
      createdAt: Date;
      changedBy: { firstName: string; lastName: string; role: Role };
    }>;
  };
  currentUserId: string;
  currentUserRole: Role;
  locale: string;
  /** Override back link target (e.g. admin ticket list). */
  ticketsListHref?: string;
}

export function TicketDetailView({
  ticket,
  currentUserId,
  currentUserRole,
  locale,
  ticketsListHref,
}: TicketDetailViewProps) {
  const router = useRouter();
  const lp = locale === "sq" ? "" : `/${locale}`;
  const backHref = ticketsListHref ?? `${lp}/portal/tickets`;
  const isStaff = STAFF_ROLES.includes(currentUserRole);

  const [comment, setComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(ticket.rating ?? 0);

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
        secondary: `${ticket.createdBy.firstName} ${ticket.createdBy.lastName}`,
      };
    }
    return {
      primary: `${ticket.createdBy.firstName} ${ticket.createdBy.lastName}`,
      secondary:
        locale === "sq"
          ? "Hapur nga stafi"
          : "Opened by staff",
    };
  })();

  // Filter comments: clients don't see internal notes
  const visibleComments = isStaff
    ? ticket.comments
    : ticket.comments.filter((c) => !c.isInternal);

  async function submitComment() {
    if (!comment.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/tickets/${ticket.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: comment, isInternal }),
    });
    setSubmitting(false);
    if (!res.ok) {
      toast.error(locale === "sq" ? "Gabim gjatë dërgimit" : "Error submitting comment");
      return;
    }
    setComment("");
    if (isStaff) setIsInternal(false);
    toast.success(locale === "sq" ? "Komenti u shtua" : "Comment added");
    router.refresh();
  }

  async function updateStatus(status: TicketStatus) {
    const res = await fetch(`/api/tickets/${ticket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      toast.error(locale === "sq" ? "Gabim" : "Error");
      return;
    }
    toast.success(locale === "sq" ? "Statusi u ndryshua" : "Status updated");
    router.refresh();
  }

  async function submitRating(stars: number) {
    setRating(stars);
    await fetch(`/api/tickets/${ticket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: stars }),
    });
    toast.success(locale === "sq" ? "Faleminderit për vlerësimin!" : "Thank you for your rating!");
    router.refresh();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {locale === "sq" ? "Kthehu" : "Back"}
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-sm font-mono text-muted-foreground">{ticket.number}</span>
          <TicketStatusBadge status={ticket.status} locale={locale} />
          <PriorityBadge priority={ticket.priority} locale={locale} />
          {ticket.slaDeadline && (
            <SlaIndicator
              createdAt={new Date(ticket.createdAt)}
              deadline={new Date(ticket.slaDeadline)}
              status={ticket.status}
              locale={locale}
            />
          )}
        </div>
        <h1 className="text-2xl font-bold">{ticket.title}</h1>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
          <span className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5 shrink-0" />
              <span>{reporterMeta.primary}</span>
            </span>
            {reporterMeta.secondary && (
              <span className="text-xs sm:text-sm sm:opacity-90">({reporterMeta.secondary})</span>
            )}
          </span>
          <span>{divLabel}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDateTime(ticket.createdAt)}
          </span>
          {ticket.assignedTo && (
            <span>
              {locale === "sq" ? "Inxhinier" : "Engineer"}:{" "}
              {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                {locale === "sq" ? "Përshkrimi" : "Description"}
              </p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </p>
            </CardContent>
          </Card>

          {/* Timeline */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold">
              {locale === "sq" ? "Kronologjia" : "Timeline"}
            </h2>

            {visibleComments.map((c) => {
              const isOwn = c.author.id === currentUserId;
              const isStaffComment = STAFF_ROLES.includes(c.author.role);

              return (
                <div
                  key={c.id}
                  className={`rounded-lg border p-4 ${
                    c.isInternal
                      ? "border-amber-200 bg-amber-50"
                      : isStaffComment
                      ? "border-primary/20 bg-primary/5"
                      : "bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {c.author.firstName[0]}
                        {c.author.lastName[0]}
                      </div>
                      <span className="text-sm font-medium">
                        {c.author.firstName} {c.author.lastName}
                      </span>
                      {c.isInternal ? (
                        <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-100 rounded px-1.5 py-0.5">
                          <Lock className="h-3 w-3" />
                          {locale === "sq" ? "Internal" : "Internal"}
                        </span>
                      ) : isStaff && isStaffComment ? (
                        <span className="flex items-center gap-1 text-xs text-sky-800 bg-sky-100 rounded px-1.5 py-0.5 dark:bg-sky-950/40 dark:text-sky-100">
                          <Users className="h-3 w-3" />
                          {locale === "sq" ? "External" : "External"}
                        </span>
                      ) : null}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(c.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{c.body}</p>
                </div>
              );
            })}

            {/* History events */}
            {ticket.history.slice(1).map((h) => (
              <div key={h.id} className="flex items-center gap-2 text-xs text-muted-foreground pl-2">
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                <span>
                  {h.changedBy.firstName} {h.changedBy.lastName}
                </span>
                <span>
                  {h.field === "status"
                    ? `→ ${h.newValue}`
                    : `${h.field}: ${h.newValue}`}
                </span>
                <span>· {timeAgo(h.createdAt)}</span>
              </div>
            ))}
          </div>

          {/* Comment form */}
          {ticket.status !== "CLOSED" && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium">
                    <MessageSquare className="h-4 w-4 inline mr-2" />
                    {locale === "sq" ? "Shto Koment" : "Add Comment"}
                  </p>
                  {isStaff && (
                    <div
                      role="group"
                      aria-label={
                        locale === "sq" ? "Dukshmëria e komentit" : "Comment visibility"
                      }
                      className="flex min-w-0 w-full max-w-full flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border/60 bg-muted px-3 py-2 sm:gap-x-5 sm:py-2"
                    >
                      <div className="flex shrink-0 items-center gap-1">
                        <span className="text-[11px] font-medium tracking-tight text-muted-foreground">
                          {locale === "sq" ? "Dukshmëria e komentit" : "Comment visibility"}
                        </span>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <button
                                type="button"
                                className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                                aria-label={
                                  locale === "sq"
                                    ? "Ndihmë: dukshmëria e komentit"
                                    : "Help: comment visibility"
                                }
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
                              {locale === "sq" ? "Dukshmëria e komentit" : "Comment visibility"}
                            </p>
                            <ul className="space-y-2.5">
                              <li className="flex gap-2.5">
                                <span className="mt-0.5 shrink-0 rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">
                                  Internal
                                </span>
                                <span className="text-muted-foreground">
                                  {locale === "sq"
                                    ? "Vetëm për stafin; klienti nuk e sheh në portal."
                                    : "Staff only; the customer does not see it in the portal."}
                                </span>
                              </li>
                              <li className="flex gap-2.5">
                                <span className="mt-0.5 shrink-0 rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">
                                  External
                                </span>
                                <span className="text-muted-foreground">
                                  {locale === "sq"
                                    ? "Klienti e sheh në portal si përgjigje publike."
                                    : "The customer sees it in the portal as a public reply."}
                                </span>
                              </li>
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-1 sm:flex-none sm:justify-end">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="comment-vis-internal-portal"
                            checked={isInternal}
                            onCheckedChange={(v) => setIsInternal(v === true)}
                          />
                          <Label
                            htmlFor="comment-vis-internal-portal"
                            className="cursor-pointer text-xs font-medium text-foreground"
                          >
                            Internal
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="comment-vis-external-portal"
                            checked={!isInternal}
                            onCheckedChange={(v) => setIsInternal(v !== true)}
                          />
                          <Label
                            htmlFor="comment-vis-external-portal"
                            className="cursor-pointer text-xs font-medium text-foreground"
                          >
                            External
                          </Label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder={
                    locale === "sq"
                      ? "Shkruani komentit tuaj..."
                      : "Write your comment..."
                  }
                  className={cn(
                    isInternal
                      ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
                      : "",
                    !isInternal && isStaff
                      ? "border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-950"
                      : ""
                  )}
                />
                <Button onClick={submitComment} disabled={submitting || !comment.trim()}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {locale === "sq" ? "Dërgo" : "Submit"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Rating (after resolved) */}
          {ticket.status === "RESOLVED" && ticket.createdBy.id === currentUserId && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-3">
                  {locale === "sq" ? "Vlerëso Shërbimin" : "Rate the Service"}
                </p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => submitRating(star)}
                      className="text-2xl transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar actions */}
        <div className="space-y-4">
          {/* Status actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{locale === "sq" ? "Veprime" : "Actions"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isStaff && ticket.status === "OPEN" && (
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => updateStatus("IN_PROGRESS")}
                >
                  {locale === "sq" ? "Fillo Punën" : "Start Working"}
                </Button>
              )}
              {isStaff && ticket.status === "IN_PROGRESS" && (
                <>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => updateStatus("RESOLVED")}
                  >
                    {locale === "sq" ? "Shëno si Zgjidhur" : "Mark Resolved"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => updateStatus("PENDING_CLIENT")}
                  >
                    {locale === "sq" ? "Prit Klientin" : "Pending Client"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => updateStatus("PAUSED")}
                  >
                    <Pause className="h-4 w-4 shrink-0" />
                    {locale === "sq" ? "Pezullo" : "Pause"}
                  </Button>
                </>
              )}
              {isStaff && ticket.status === "PAUSED" && (
                <Button
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => updateStatus("IN_PROGRESS")}
                >
                  <Play className="h-4 w-4 shrink-0" />
                  {locale === "sq" ? "Vazhdo punën" : "Resume work"}
                </Button>
              )}
              {!isStaff && ticket.status === "PENDING_CLIENT" && (
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => updateStatus("IN_PROGRESS")}
                >
                  {locale === "sq" ? "U Përgjigja" : "I Responded"}
                </Button>
              )}
              {ticket.status === "RESOLVED" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => updateStatus("CLOSED")}
                  >
                    {locale === "sq" ? "Mbyll Biletën" : "Close Ticket"}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full"
                    onClick={() => updateStatus("IN_PROGRESS")}
                  >
                    {locale === "sq" ? "Rihap" : "Reopen"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{locale === "sq" ? "Statusi" : "Status"}</p>
                <TicketStatusBadge status={ticket.status} locale={locale} />
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">{locale === "sq" ? "Prioriteti" : "Priority"}</p>
                <PriorityBadge priority={ticket.priority} locale={locale} />
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">{locale === "sq" ? "Divisioni" : "Division"}</p>
                <p className="text-sm">{divLabel}</p>
              </div>
              {ticket.slaDeadline && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">SLA</p>
                    <SlaIndicator
                      createdAt={new Date(ticket.createdAt)}
                      deadline={new Date(ticket.slaDeadline)}
                      status={ticket.status}
                      locale={locale}
                    />
                  </div>
                </>
              )}
              {ticket.company && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{locale === "sq" ? "Kompania" : "Company"}</p>
                    <p className="text-sm">{ticket.company.name}</p>
                  </div>
                </>
              )}
              {estimateLabel && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {locale === "sq" ? "Vlerësimi" : "Estimate"}
                    </p>
                    <p className="text-sm font-medium tabular-nums">{estimateLabel}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
