import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FolderKanban } from "lucide-react";
import { portalUser } from "@/lib/portal/access";
import { portalProjectClientWhere } from "@/lib/portal/scope";
import { PortalProjectsTable, type PortalProjectRow } from "@/components/portal/tables/portal-projects-table";
import { adminListShellClassName } from "@/lib/admin-list-ui";

export default async function PortalProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/hyr");

  const { locale } = await params;
  const lp = locale === "sq" ? "" : `/${locale}`;
  const t = await getTranslations("portal");
  const user = portalUser(session);

  const links = await db.projectClient.findMany({
    where: portalProjectClientWhere(user),
    include: {
      project: {
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          updatedAt: true,
          description: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const seen = new Set<string>();
  const projects = links
    .map((l) => l.project)
    .filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

  const rows: PortalProjectRow[] = projects.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    status: p.status,
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-5">
      <AdminPageHeader title={t("projects_title")} description={t("projects_desc")} />

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={t("projects_empty")}
          description={t("projects_empty_desc")}
        />
      ) : (
        <div className={adminListShellClassName}>
          <PortalProjectsTable rows={rows} locale={locale} lp={lp} />
        </div>
      )}
    </div>
  );
}
