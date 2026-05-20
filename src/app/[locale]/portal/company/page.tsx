import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Building2 } from "lucide-react";
import { requireCompanyAdminPage, requireCompanyId } from "@/lib/portal/access";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function PortalCompanyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/hyr");

  const { locale } = await params;
  requireCompanyAdminPage(session, locale);
  const companyId = requireCompanyId(session, locale);

  const t = await getTranslations("portal");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      company: {
        select: {
          id: true,
          name: true,
          vatNumber: true,
          address: true,
          city: true,
          country: true,
          tier: true,
          isApproved: true,
        },
      },
      registrationCompanySnapshot: true,
      registeredCompany: {
        select: { id: true, name: true },
      },
    },
  });

  const company = user?.company;
  if (!company) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title={t("company_page_title")} description={t("company_page_desc")} />
        <EmptyState
          icon={Building2}
          title={t("company_not_linked")}
          description={t("company_not_linked_desc")}
        />
      </div>
    );
  }

  const snapshot = user?.registrationCompanySnapshot as Record<string, string> | null;
  const showSnapshot =
    user?.registeredCompany && user.registeredCompany.id !== company.id && snapshot;

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("company_page_title")} description={t("company_page_desc")} />

      <Card className="admin-card-elevated">
        <CardHeader className="border-b pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <CardTitle className="text-base font-semibold">{company.name}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{company.tier}</Badge>
              <Badge variant={company.isApproved ? "default" : "outline"}>
                {company.isApproved ? t("company_approved") : t("company_pending")}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
          <Detail label="NIPT" value={company.vatNumber ?? "—"} />
          <Detail label={t("company_tier")} value={company.tier} />
          <Detail label={locale === "sq" ? "Adresa" : "Address"} value={company.address ?? "—"} />
          <Detail label={locale === "sq" ? "Qyteti" : "City"} value={company.city ?? "—"} />
          <Detail label={locale === "sq" ? "Shteti" : "Country"} value={company.country} />
        </CardContent>
      </Card>

      {showSnapshot ? (
        <Card className="admin-card-elevated">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-sm font-semibold">{t("company_registration_snapshot")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 p-6 sm:grid-cols-2">
            {Object.entries(snapshot).map(([key, value]) => (
              <Detail key={key} label={key} value={String(value)} />
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
