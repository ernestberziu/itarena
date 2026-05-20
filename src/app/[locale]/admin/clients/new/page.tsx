import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminClientNewForm } from "@/components/admin/admin-client-new-form";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageWrite } from "@/lib/admin-acl/page-guard";

export default async function AdminClientNewPage({ params }: { params: Promise<{ locale: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/hyr");

  const { locale } = await params;
  const acl = await getCachedEffectiveAcl(session.user.id);
  if (!acl) redirect("/hyr");
  requireAdminPageWrite(locale, acl, "clients");

  const lp = locale === "sq" ? "" : `/${locale}`;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[
          { label: locale === "sq" ? "Klientët" : "Clients", href: `${lp}/admin/clients` },
          { label: locale === "sq" ? "I ri" : "New" },
        ]}
        title={locale === "sq" ? "Klient i ri" : "New client"}
        description={
          locale === "sq"
            ? "Krijo llogari klienti dhe lidhe me kompani opsionale."
            : "Create a client account and optionally link to a company."
        }
      />
      <AdminClientNewForm locale={locale} lp={lp} />
    </div>
  );
}
