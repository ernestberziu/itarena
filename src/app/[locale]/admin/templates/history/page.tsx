import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";
import { DocumentsTable } from "@/components/admin/templates/documents-table";

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

  return <DocumentsTable lp={lp} title={t("history")} />;
}
