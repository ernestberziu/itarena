import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminCompanyForm } from "@/components/admin/admin-company-form";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageWrite } from "@/lib/admin-acl/page-guard";

export default async function AdminCompanyNewPage({ params }: { params: Promise<{ locale: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/hyr");

  const { locale } = await params;
  const acl = await getCachedEffectiveAcl(session.user.id);
  if (!acl) redirect("/hyr");
  requireAdminPageWrite(locale, acl, "companies");

  const lp = locale === "sq" ? "" : `/${locale}`;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[
          { label: locale === "sq" ? "Kompanitë" : "Companies", href: `${lp}/admin/companies` },
          { label: locale === "sq" ? "E re" : "New" },
        ]}
        title={locale === "sq" ? "Kompani e re" : "New company"}
      />
      <AdminCompanyForm locale={locale} lp={lp} mode="create" />
    </div>
  );
}
