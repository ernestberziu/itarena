import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";
import { DocumentsTable } from "@/components/admin/templates/documents-table";
import { loadAdminDocumentsList } from "@/lib/admin-documents-list";
import { ADMIN_LIST_PAGE_SIZE } from "@/lib/admin-list-pagination";

export default async function TemplatesHistoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/hyr");

  const { locale } = await params;
  const acl = await getCachedEffectiveAcl(session.user.id);
  if (!acl) redirect("/hyr");
  requireAdminPageRead(locale, acl, "templates");

  const lp = locale === "sq" ? "" : `/${locale}`;
  const t = await getTranslations({ locale, namespace: "admin.templatesPage" });

  const { items: initialDocuments, total: totalCount } = await loadAdminDocumentsList({
    take: ADMIN_LIST_PAGE_SIZE,
    skip: 0,
  });

  return (
    <DocumentsTable
      lp={lp}
      locale={locale}
      title={t("history")}
      initialDocuments={initialDocuments}
      totalCount={totalCount}
      pageSize={ADMIN_LIST_PAGE_SIZE}
      filterQuery=""
    />
  );
}
