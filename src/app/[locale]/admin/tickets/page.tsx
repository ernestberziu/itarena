import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, AlertTriangle, Ticket, Clock, Search, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTicketsFilterDeck } from "@/components/admin/admin-tickets-filter-deck";
import { EmptyState } from "@/components/shared/empty-state";
import {
  SegmentedFilterTrack,
  SegmentedFilterLink,
} from "@/components/admin/admin-filter-segments";
import { AdminTicketsTable } from "@/components/admin/admin-tickets-table";
import { AdminTicketsAssigneeSelect } from "@/components/admin/admin-tickets-filters-assignee";
import { Separator } from "@/components/ui/separator";
import {
  ADMIN_TICKET_STATUS_OPTIONS,
  ADMIN_TICKET_PRIORITY_OPTIONS,
} from "@/lib/admin-ticket-filters";
import { adminTicketsListWhere } from "@/lib/admin-tickets-list-query";
import { mapTicketToAdminRow } from "@/lib/admin-tickets-list-dto";
import { getMissedSlaTicketIds } from "@/lib/sla";
import { cn } from "@/lib/utils";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";

const TICKETS_PAGE_SIZE = 25;

export default async function AdminTicketsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/hyr");

  const { locale } = await params;
  const acl = await getCachedEffectiveAcl(session.user.id);
  if (!acl) redirect("/hyr");
  requireAdminPageRead(locale, acl, "tickets");

  const sp = await searchParams;
  const lp = locale === "sq" ? "" : `/${locale}`;

  const statusFilter = sp.status;
  const priorityFilter = sp.priority;
  const breachedOnly = sp.filter === "breached";
  const q = sp.q?.trim();

  const assigneeFilter = sp.assignee?.trim();
  const requesterFilter = sp.requester?.trim();
  const projectIdFilter = sp.projectId?.trim();

  const listQuery = {
    q,
    status: statusFilter,
    priority: priorityFilter,
    filter: breachedOnly ? ("breached" as const) : null,
    assignee: assigneeFilter,
    requester: requesterFilter,
    projectId: projectIdFilter,
  };
  let where = adminTicketsListWhere(listQuery);
  const missedSlaIds = await getMissedSlaTicketIds(db);

  if (breachedOnly) {
    where = {
      AND: [where, { id: { in: missedSlaIds.length > 0 ? missedSlaIds : [] } }],
    };
  }

  const listOrderBy = [
    { slaDeadline: "asc" as const },
    { priority: "desc" as const },
    { updatedAt: "desc" as const },
  ];

  const ticketInclude = {
    createdBy: { select: { firstName: true, lastName: true, email: true } },
    assignedTo: { select: { firstName: true, lastName: true } },
    company: { select: { name: true } },
    project: { select: { id: true, title: true } },
  } as const;

  const [tickets, totalCount, openCount, breachedCount, assigneeOptions] = await Promise.all([
    db.ticket.findMany({
      where,
      orderBy: listOrderBy,
      take: TICKETS_PAGE_SIZE,
      skip: 0,
      include: ticketInclude,
    }),
    db.ticket.count({ where }),
    db.ticket.count({
      where: { AND: [where, { status: { notIn: ["RESOLVED", "CLOSED"] } }] },
    }),
    db.ticket.count({
      where: { AND: [where, { id: { in: missedSlaIds.length > 0 ? missedSlaIds : [] } }] },
    }),
    db.user.findMany({
      where: { role: { in: ["ADMIN", "ENGINEER", "SALES", "OPS"] } },
      select: { id: true, firstName: true, lastName: true },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    }),
  ]);

  const rows = tickets.map(mapTicketToAdminRow);

  const filterQueryParts = new URLSearchParams();
  if (q) filterQueryParts.set("q", q);
  if (statusFilter) filterQueryParts.set("status", statusFilter);
  if (priorityFilter) filterQueryParts.set("priority", priorityFilter);
  if (breachedOnly) filterQueryParts.set("filter", "breached");
  if (assigneeFilter) filterQueryParts.set("assignee", assigneeFilter);
  if (requesterFilter) filterQueryParts.set("requester", requesterFilter);
  const filterQuery = filterQueryParts.toString();

  const statusLabel =
    locale === "sq"
      ? {
          OPEN: "Hapur",
          ASSIGNED: "Caktuar",
          IN_PROGRESS: "Në punë",
          PAUSED: "Në pauzë",
          PENDING_CLIENT: "Pret",
          RESOLVED: "Zgjidhur",
          CLOSED: "Mbyllur",
        }
      : {
          OPEN: "Open",
          ASSIGNED: "Assigned",
          IN_PROGRESS: "In Progress",
          PAUSED: "Paused",
          PENDING_CLIENT: "Pending",
          RESOLVED: "Resolved",
          CLOSED: "Closed",
        };

  const priorityLabel =
    locale === "sq"
      ? { CRITICAL: "Kritike", HIGH: "E lartë", MEDIUM: "Mesatare", LOW: "E ulët" }
      : { CRITICAL: "Critical", HIGH: "High", MEDIUM: "Medium", LOW: "Low" };

  function filterHref(key: string, value: string | null) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (key !== "status" && statusFilter) p.set("status", statusFilter);
    if (key !== "priority" && priorityFilter) p.set("priority", priorityFilter);
    if (key !== "filter" && breachedOnly) p.set("filter", "breached");
    if (key !== "assignee" && assigneeFilter) p.set("assignee", assigneeFilter);
    if (key !== "requester" && requesterFilter) p.set("requester", requesterFilter);
    if (value) p.set(key, value);
    const qs = p.toString();
    return qs ? `${lp}/admin/tickets?${qs}` : `${lp}/admin/tickets`;
  }

  function ticketsHref(extra: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (statusFilter) p.set("status", statusFilter);
    if (priorityFilter) p.set("priority", priorityFilter);
    if (breachedOnly) p.set("filter", "breached");
    if (assigneeFilter) p.set("assignee", assigneeFilter);
    if (requesterFilter) p.set("requester", requesterFilter);
    for (const [k, v] of Object.entries(extra)) {
      if (v === undefined) p.delete(k);
      else if (v === "") p.delete(k);
      else p.set(k, v);
    }
    const qs = p.toString();
    return qs ? `${lp}/admin/tickets?${qs}` : `${lp}/admin/tickets`;
  }

  const statCard = (
    label: string,
    value: number,
    Icon: LucideIcon,
    tone: "default" | "amber" | "rose"
  ) => {
    const tones = {
      default: "border-border/60 bg-card text-foreground shadow-sm",
      amber: "border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-card text-foreground shadow-sm",
      rose: "border-rose-200/80 bg-gradient-to-br from-rose-50/90 to-card text-foreground shadow-sm",
    } as const;
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border px-4 py-3 transition-shadow hover:shadow-md",
          tones[tone]
        )}
      >
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-background/80",
            tone === "rose" && "border-rose-200/60 text-rose-600",
            tone === "amber" && "border-amber-200/60 text-amber-700",
            tone === "default" && "border-border/80 text-primary"
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-bold tabular-nums tracking-tight">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={locale === "sq" ? "Biletat" : "Tickets"}
        description={
          locale === "sq"
            ? "Menaxho kërkesat e mbështetjes dhe SLA-të."
            : "Manage support requests and SLAs."
        }
        actions={
          <Button asChild size="sm" className="shadow-sm">
            <Link href={`${lp}/admin/tickets/new`}>
              <Plus className="h-4 w-4 mr-1.5" strokeWidth={2} />
              {locale === "sq" ? "Biletë e re" : "New ticket"}
            </Link>
          </Button>
        }
        toolbar={
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {statCard(
                locale === "sq" ? "Në këtë pamje" : "In this view",
                totalCount,
                Ticket,
                "default"
              )}
              {statCard(
                locale === "sq" ? "Të hapura" : "Open",
                openCount,
                Clock,
                "amber"
              )}
              {statCard(
                locale === "sq" ? "SLA i shkelur" : "SLA breached",
                breachedCount,
                AlertTriangle,
                "rose"
              )}
            </div>

            <AdminTicketsFilterDeck
              defaultOpen={Boolean(
                q || statusFilter || priorityFilter || breachedOnly || assigneeFilter || requesterFilter
              )}
              title={locale === "sq" ? "Filtro rezultatet" : "Filter results"}
              hint={
                locale === "sq"
                  ? "Kërko, filtro sipas statusit, prioritetit, inxhinierit ose SLA-së."
                  : "Search, then narrow by status, priority, assignee, or SLA."
              }
              clearAll={
                (q ||
                  statusFilter ||
                  priorityFilter ||
                  breachedOnly ||
                  assigneeFilter ||
                  requesterFilter) ? (
                  <Link
                    href={`${lp}/admin/tickets`}
                    className="inline-flex rounded-lg border border-transparent px-2 py-1.5 text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:border-border/60 hover:bg-background/80 hover:text-foreground hover:underline"
                  >
                    {locale === "sq" ? "Hiq të gjitha" : "Clear all"}
                  </Link>
                ) : null
              }
            >
              <>
                <div className="w-full max-w-2xl">
                  <form
                    method="GET"
                    action={`${lp}/admin/tickets`}
                    className="flex flex-col gap-2 sm:flex-row sm:items-stretch"
                  >
                    <div className="flex min-w-0 flex-1 items-center rounded-xl border border-border/60 bg-muted/20 p-1 shadow-inner dark:bg-muted/15">
                      <div className="relative min-w-0 flex-1">
                        <Search
                          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                          strokeWidth={2}
                          aria-hidden
                        />
                        <Input
                          name="q"
                          defaultValue={q}
                          placeholder={
                            locale === "sq"
                              ? "Titulli ose numri i biletës…"
                              : "Ticket title or number…"
                          }
                          className="h-10 border-0 bg-transparent pl-10 pr-3 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 md:text-sm"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
                    {priorityFilter && <input type="hidden" name="priority" value={priorityFilter} />}
                    {breachedOnly && <input type="hidden" name="filter" value="breached" />}
                    {assigneeFilter && <input type="hidden" name="assignee" value={assigneeFilter} />}
                    {requesterFilter && <input type="hidden" name="requester" value={requesterFilter} />}
                    <Button
                      type="submit"
                      className="h-10 shrink-0 gap-2 rounded-xl px-5 shadow-sm sm:w-auto w-full"
                    >
                      <Search className="h-4 w-4" strokeWidth={2} aria-hidden />
                      {locale === "sq" ? "Kërko" : "Search"}
                    </Button>
                  </form>
                </div>

                <Separator className="bg-border/60" />

                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="space-y-2">
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {locale === "sq" ? "Statusi" : "Status"}
                    </span>
                    <SegmentedFilterTrack>
                      {[null, ...ADMIN_TICKET_STATUS_OPTIONS].map((s) => {
                        const selected = statusFilter === s || (!statusFilter && !s);
                        const label = s
                          ? statusLabel[s as keyof typeof statusLabel]
                          : locale === "sq"
                            ? "Të gjitha"
                            : "All";
                        return (
                          <SegmentedFilterLink
                            key={s ?? "all"}
                            href={filterHref("status", s)}
                            label={label}
                            selected={selected}
                          />
                        );
                      })}
                    </SegmentedFilterTrack>
                  </div>

                  <div className="space-y-2">
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {locale === "sq" ? "Prioriteti" : "Priority"}
                    </span>
                    <SegmentedFilterTrack>
                      {[null, ...ADMIN_TICKET_PRIORITY_OPTIONS].map((p) => {
                        const selected = priorityFilter === p || (!priorityFilter && !p);
                        const label = p
                          ? priorityLabel[p as keyof typeof priorityLabel]
                          : locale === "sq"
                            ? "Të gjitha"
                            : "All";
                        return (
                          <SegmentedFilterLink
                            key={p ?? "all"}
                            href={filterHref("priority", p)}
                            label={label}
                            selected={selected}
                          />
                        );
                      })}
                    </SegmentedFilterTrack>
                  </div>

                  <div className="space-y-2">
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {locale === "sq" ? "Inxhinieri" : "Assignee"}
                    </span>
                    <AdminTicketsAssigneeSelect
                      listPrefix={lp}
                      engineers={assigneeOptions}
                      assignee={assigneeFilter}
                      requester={requesterFilter}
                      q={q}
                      status={statusFilter}
                      priority={priorityFilter}
                      breached={breachedOnly}
                      labels={{
                        placeholder: locale === "sq" ? "Zgjidh inxhinierin" : "Choose assignee",
                        all: locale === "sq" ? "Të gjithë" : "Everyone",
                        unassigned: locale === "sq" ? "I pacaktuar" : "Unassigned",
                      }}
                    />
                  </div>
                </div>

                <Separator className="bg-border/60" />

                <div
                  className={cn(
                    "flex flex-col gap-3 rounded-xl border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between",
                    breachedOnly
                      ? "border-destructive/35 bg-destructive/[0.07]"
                      : "border-border/50 bg-muted/20 dark:bg-muted/15"
                  )}
                >
                  <p className="max-w-prose text-xs leading-relaxed text-muted-foreground">
                    {locale === "sq"
                      ? "Shfaq vetëm biletat me SLA të shkelur (jo të mbyllura)."
                      : "Show only tickets with breached SLA (excluding closed)."}
                  </p>
                  <Link
                    href={ticketsHref({ filter: breachedOnly ? undefined : "breached" })}
                    scroll={false}
                    className={cn(
                      "inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors sm:w-auto",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      breachedOnly
                        ? "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
                        : "border border-rose-200/80 bg-background text-rose-800 shadow-sm hover:bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-100 dark:hover:bg-rose-950/60"
                    )}
                  >
                    <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                    {breachedOnly
                      ? locale === "sq"
                        ? "SLA e shkelur · Hiq"
                        : "SLA breached · Turn off"
                      : locale === "sq"
                        ? "Vetëm SLA të shkelura"
                        : "SLA breached only"}
                  </Link>
                </div>
              </>
            </AdminTicketsFilterDeck>
          </div>
        }
      />

      {totalCount === 0 ? (
        <EmptyState
          icon={Ticket}
          title={locale === "sq" ? "Nuk u gjetën bileta" : "No tickets found"}
          description={
            locale === "sq"
              ? "Provoni filtra të tjerë ose kërkim të ri."
              : "Try different filters or a new search."
          }
          action={{ label: locale === "sq" ? "Hiq filtrat" : "Clear filters", href: `${lp}/admin/tickets` }}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/30 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.06]">
          <AdminTicketsTable
            initialTickets={rows}
            totalCount={totalCount}
            pageSize={TICKETS_PAGE_SIZE}
            locale={locale}
            listPrefix={lp}
            filterQuery={filterQuery}
          />
        </div>
      )}
    </div>
  );
}
