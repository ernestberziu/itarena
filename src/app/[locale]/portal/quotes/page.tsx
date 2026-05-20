import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PortalQuotesTable, type PortalQuoteRow } from "@/components/portal/tables/portal-quotes-table";
import { requireCompanyAdminPage } from "@/lib/portal/access";
import { portalQuoteWhere, portalUsesCompanyScope } from "@/lib/portal/scope";
import { portalUser } from "@/lib/portal/access";
import { adminListShellClassName } from "@/lib/admin-list-ui";

export default async function QuotesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/hyr");

  const { locale } = await params;
  requireCompanyAdminPage(session, locale);

  const t = await getTranslations({ locale, namespace: "quotes" });
  const tPortal = await getTranslations({ locale, namespace: "portal" });
  const lp = locale === "sq" ? "" : `/${locale}`;
  const user = portalUser(session);
  const companyScope = portalUsesCompanyScope(user);

  const quotes = await db.quote.findMany({
    where: portalQuoteWhere(user),
    orderBy: { createdAt: "desc" },
    include: { requestedBy: { select: { firstName: true, lastName: true } } },
  });

  const rows: PortalQuoteRow[] = quotes.map((quote) => ({
    id: quote.id,
    quoteNumber: quote.quoteNumber,
    title: quote.title,
    status: quote.status,
    amount: quote.total != null ? Number(quote.total) : null,
    validUntil: quote.validUntil?.toISOString() ?? null,
    createdAt: quote.createdAt.toISOString(),
    pdfUrl: quote.pdfUrl,
    requestedBy: quote.requestedBy,
  }));

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title={t("title")}
        description={
          companyScope
            ? `${quotes.length} ${locale === "sq" ? "oferta" : "quotes"} · ${tPortal("company_scope_hint")}`
            : `${quotes.length} ${locale === "sq" ? "oferta" : "quotes"}`
        }
        actions={
          <Button asChild size="sm">
            <Link href={`${lp}/kerko-oferte`}>
              <Plus className="mr-1.5 h-4 w-4" strokeWidth={2} />
              {t("new")}
            </Link>
          </Button>
        }
      />

      {quotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={t("empty")}
          description={t("empty_desc")}
          action={{ label: t("new"), href: `${lp}/kerko-oferte` }}
        />
      ) : (
        <div className={adminListShellClassName}>
          <PortalQuotesTable
            rows={rows}
            locale={locale}
            companyScope={companyScope}
            labels={{
              accept: t("accept"),
              reject: t("reject"),
              download_pdf: tPortal("download_pdf"),
            }}
          />
        </div>
      )}
    </div>
  );
}
