import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectsTable } from "@/components/admin/projects/projects-table";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";
import { hasAclLevel } from "@/lib/admin-acl/features";
import { projectsListWhere, projectListInclude } from "@/lib/projects";
import type { ProjectListRow } from "@/lib/projects/types";

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
  const status = sp.status?.trim();
  const en = locale === "en";

  const where = await projectsListWhere(session.user.id, { q, status });

  const projects = await db.project.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }],
    include: projectListInclude,
  });

  const rows: ProjectListRow[] = projects.map((p) => ({
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

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={en ? "Projects" : "Projektet"}
        description={
          en
            ? "Manage client projects, tickets, and team access."
            : "Menaxhoni projektet, biletat dhe aksesin e ekipit."
        }
        toolbar={
          canWrite ? (
            <Button size="sm" asChild>
              <Link href={`${lp}/admin/projects/new`}>
                <Plus className="h-4 w-4 mr-1" />
                {en ? "New project" : "Projekt i ri"}
              </Link>
            </Button>
          ) : undefined
        }
      />

      <form method="get" className="flex flex-wrap gap-2">
        <Input
          name="q"
          defaultValue={q}
          placeholder={en ? "Search projects…" : "Kërko projekte…"}
          className="max-w-xs"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">{en ? "All statuses" : "Të gjitha"}</option>
          <option value="ACTIVE">{en ? "Active" : "Aktiv"}</option>
          <option value="ARCHIVED">{en ? "Archived" : "Arkivuar"}</option>
        </select>
        <Button type="submit" variant="secondary" size="sm">
          {en ? "Filter" : "Filtro"}
        </Button>
      </form>

      {rows.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={en ? "No projects yet" : "Nuk ka projekte ende"}
          description={
            en
              ? "Create a project or ask an admin to add you to one."
              : "Krijoni një projekt ose kërkoni akses nga administratori."
          }
        />
      ) : (
        <ProjectsTable rows={rows} listPrefix={lp} locale={locale} />
      )}
    </div>
  );
}
