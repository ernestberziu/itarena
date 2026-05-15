import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PortalQuoteCard } from "@/components/portal/quote-card";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function QuotesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/hyr");

  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "quotes" });
  const lp = locale === "sq" ? "" : `/${locale}`;

  const quotes = await db.quote.findMany({
    where: { requestedById: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("title")}
        description={`${quotes.length} ${locale === "sq" ? "oferta" : "quotes"}`}
        actions={
          <Button asChild size="sm">
            <Link href={`${lp}/kerko-oferte`}>
              <Plus className="h-4 w-4 mr-1.5" strokeWidth={2} />
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
        <div className="space-y-3">
          {quotes.map((quote) => (
            <PortalQuoteCard
              key={quote.id}
              quote={{
                id: quote.id,
                quoteNumber: quote.quoteNumber,
                title: quote.title,
                status: quote.status,
                amount: quote.total != null ? Number(quote.total) : null,
                notes: quote.clientNote ?? null,
                validUntil: quote.validUntil,
                createdAt: quote.createdAt,
              }}
              locale={locale}
              t={{
                accept: t("accept"),
                reject: t("reject"),
                valid_until: t("valid_until"),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
