import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { NewTicketForm } from "@/components/portal/new-ticket-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageWrite } from "@/lib/admin-acl/page-guard";
import { db } from "@/lib/db";
import { projectsListWhere } from "@/lib/projects";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tickets" });
  return { title: t("new") };
}

export default async function AdminNewTicketPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ projectId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/hyr");

  const { locale } = await params;
  const sp = await searchParams;
  const acl = await getCachedEffectiveAcl(session.user.id);
  if (!acl) redirect("/hyr");
  requireAdminPageWrite(locale, acl, "tickets");

  const projects = await db.project.findMany({
    where: await projectsListWhere(session.user.id, { status: "ACTIVE" }),
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  const initialProjectId = sp.projectId?.trim() || null;
  const projectValid =
    initialProjectId && projects.some((p) => p.id === initialProjectId)
      ? initialProjectId
      : null;

  const t = await getTranslations({ locale, namespace: "tickets" });
  const lp = locale === "sq" ? "" : `/${locale}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-1 lg:max-w-4xl">
      <AdminPageHeader
        title={t("new")}
        description={
          locale === "sq"
            ? "Krijo një bilete për një klient ose për një kërkues pa llogari portali."
            : "Create a ticket for a portal client or a requester without a portal account."
        }
        breadcrumbs={[
          { label: locale === "sq" ? "Biletat" : "Tickets", href: `${lp}/admin/tickets` },
          { label: t("new") },
        ]}
      />
      <NewTicketForm variant="admin" projects={projects} initialProjectId={projectValid} />
    </div>
  );
}
