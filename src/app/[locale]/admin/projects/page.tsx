import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Archive, CircleCheck, FolderKanban, Plus, Search, type LucideIcon } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTicketsFilterDeck } from "@/components/admin/admin-tickets-filter-deck";
import {
  SegmentedFilterLink,
  SegmentedFilterTrack,
} from "@/components/admin/admin-filter-segments";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ProjectsTable } from "@/components/admin/projects/projects-table";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";
import { hasAclLevel } from "@/lib/admin-acl/features";
import { projectsListWhere, projectListInclude } from "@/lib/projects";
import { PROJECT_STATUSES, type ProjectListRow } from "@/lib/projects/types";
import { ADMIN_LIST_PAGE_SIZE } from "@/lib/admin-list-pagination";
import { adminListShellClassName } from "@/lib/admin-list-ui";
import { cn } from "@/lib/utils";

export default async function AdminProjectsPage({
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
  requireAdminPageRead(locale, acl, "projects");

  const sp = await searchParams;
  const lp = locale === "sq" ? "" : `/${locale}`;
  const q = sp.q?.trim();
  const statusFilter = sp.status?.trim();
  const en = locale === "en";
  const hasFilters = Boolean(q || statusFilter);

  const where = await projectsListWhere(session.user.id, { q, status: statusFilter });
  const baseWhere = await projectsListWhere(session.user.id, { q, status: undefined });

  const filterQueryParts = new URLSearchParams();
  if (q) filterQueryParts.set("q", q);
  if (statusFilter) filterQueryParts.set("status", statusFilter);
  const filterQuery = filterQueryParts.toString();

  const [projects, totalCount, activeCount, completedCount, archivedCount] = await Promise.all([
    db.project.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      include: projectListInclude,
      take: ADMIN_LIST_PAGE_SIZE,
      skip: 0,
    }),
    db.project.count({ where }),
    db.project.count({ where: { ...baseWhere, status: "ACTIVE" } }),
    db.project.count({ where: { ...baseWhere, status: "COMPLETED" } }),
    db.project.count({ where: { ...baseWhere, status: "ARCHIVED" } }),
  ]);

  const initialRows: ProjectListRow[] = projects.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    status: p.status as ProjectListRow["status"],
    description: p.description,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    createdBy: p.createdBy,
    _count: p._count,
  }));

  const canWrite = hasAclLevel(acl, "projects", "write");

  const statusLabel =
    locale === "sq"
      ? { ACTIVE: "Aktiv", COMPLETED: "Përfunduar", ARCHIVED: "Arkivuar" }
      : { ACTIVE: "Active", COMPLETED: "Completed", ARCHIVED: "Archived" };

  function filterHref(key: string, value: string | null) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (key !== "status" && statusFilter) p.set("status", statusFilter);
    if (value) p.set(key, value);
    const qs = p.toString();
    return qs ? `${lp}/admin/projects?${qs}` : `${lp}/admin/projects`;
  }

  const statCard = (
    label: string,
    value: number,
    Icon: LucideIcon,
    tone: "default" | "amber" | "blue" | "rose"
  ) => {
    const tones = {
      default: "border-border/60 bg-card text-foreground shadow-sm",
      amber: "border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-card text-foreground shadow-sm",
      blue: "border-blue-200/80 bg-gradient-to-br from-blue-50/90 to-card text-foreground shadow-sm",
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
            tone === "blue" && "border-blue-200/60 text-blue-700",
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
          <p className="admin-stat-value text-lg font-bold tabular-nums leading-snug tracking-tight">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={en ? "Projects" : "Projektet"}
        description={
          en
            ? "Manage client projects, tickets, and team access."
            : "Menaxhoni projektet, biletat dhe aksesin e ekipit."
        }
        actions={
          canWrite ? (
            <Button asChild size="sm" className="shadow-sm">
              <Link href={`${lp}/admin/projects/new`}>
                <Plus className="h-4 w-4 mr-1.5" strokeWidth={2} />
                {en ? "New project" : "Projekt i ri"}
              </Link>
            </Button>
          ) : undefined
        }
        toolbar={
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {statCard(
                en ? "In this view" : "Në këtë pamje",
                totalCount,
                FolderKanban,
                "default"
              )}
              {statCard(en ? "Active" : "Aktiv", activeCount, FolderKanban, "amber")}
              {statCard(en ? "Completed" : "Përfunduar", completedCount, CircleCheck, "blue")}
              {statCard(en ? "Archived" : "Arkivuar", archivedCount, Archive, "rose")}
            </div>

            <AdminTicketsFilterDeck
              defaultOpen={hasFilters}
              title={en ? "Filter results" : "Filtro rezultatet"}
              hint={
                en
                  ? "Search by title or slug, then narrow by status."
                  : "Kërko sipas titullit ose slug-ut, pastaj filtro sipas statusit."
              }
              clearAll={
                hasFilters ? (
                  <Link
                    href={`${lp}/admin/projects`}
                    className="inline-flex rounded-lg border border-transparent px-2 py-1.5 text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:border-border/60 hover:bg-background/80 hover:text-foreground hover:underline"
                  >
                    {en ? "Clear all" : "Hiq të gjitha"}
                  </Link>
                ) : null
              }
            >
              <>
                <div className="w-full max-w-2xl">
                  <form
                    method="GET"
                    action={`${lp}/admin/projects`}
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
                            en ? "Project title or slug…" : "Titulli ose slug i projektit…"
                          }
                          className="h-10 border-0 bg-transparent pl-10 pr-3 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 md:text-sm"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
                    <Button
                      type="submit"
                      className="h-10 shrink-0 gap-2 rounded-xl px-5 shadow-sm sm:w-auto w-full"
                    >
                      <Search className="h-4 w-4" strokeWidth={2} aria-hidden />
                      {en ? "Search" : "Kërko"}
                    </Button>
                  </form>
                </div>

                <Separator className="bg-border/60" />

                <div className="space-y-2 max-w-xl">
                  <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {en ? "Status" : "Statusi"}
                  </span>
                  <SegmentedFilterTrack>
                    {[null, ...PROJECT_STATUSES].map((s) => {
                      const selected = statusFilter === s || (!statusFilter && !s);
                      const label = s
                        ? statusLabel[s]
                        : en
                          ? "All"
                          : "Të gjitha";
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
              </>
            </AdminTicketsFilterDeck>
          </div>
        }
      />

      {totalCount === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={hasFilters ? (en ? "No projects match" : "Nuk u gjetën projekte") : en ? "No projects yet" : "Nuk ka projekte ende"}
          description={
            hasFilters
              ? en
                ? "Try different filters or a new search."
                : "Provoni filtra të tjerë ose kërkim të ri."
              : en
                ? "Create a project or ask an admin to add you to one."
                : "Krijoni një projekt ose kërkoni akses nga administratori."
          }
          action={
            hasFilters
              ? { label: en ? "Clear filters" : "Hiq filtrat", href: `${lp}/admin/projects` }
              : canWrite
                ? { label: en ? "New project" : "Projekt i ri", href: `${lp}/admin/projects/new` }
                : undefined
          }
        />
      ) : (
        <div className={adminListShellClassName}>
          <ProjectsTable
            initialRows={initialRows}
            totalCount={totalCount}
            pageSize={ADMIN_LIST_PAGE_SIZE}
            listPrefix={lp}
            locale={locale}
            filterQuery={filterQuery}
            canWrite={canWrite}
          />
        </div>
      )}
    </div>
  );
}
