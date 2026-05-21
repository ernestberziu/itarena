import { notFound, redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { EmailClientButton } from "@/components/admin/email-client-button";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminQuoteDetailView,
  type AdminQuoteDetailModel,
} from "@/components/admin/admin-quote-detail-view";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";

export default async function AdminQuoteDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/hyr");

  const { locale, id } = await params;
  const acl = await getCachedEffectiveAcl(session.user.id);
  if (!acl) redirect("/hyr");
  requireAdminPageRead(locale, acl, "quotes");

  const lp = locale === "sq" ? "" : `/${locale}`;
  const en = locale === "en";

  const quote = await db.quote.findUnique({
    where: { id },
    include: {
      requestedBy: { select: { firstName: true, lastName: true, email: true } },
      company: { select: { name: true } },
    },
  });

  if (!quote) notFound();

  const model: AdminQuoteDetailModel = {
    id: quote.id,
    quoteNumber: quote.quoteNumber,
    companyName: quote.companyName,
    contactName: quote.contactName,
    contactEmail: quote.contactEmail,
    contactPhone: quote.contactPhone,
    vatNumber: quote.vatNumber,
    title: quote.title,
    description: quote.description,
    services: quote.services,
    timeline: quote.timeline,
    attachments: quote.attachments,
    status: quote.status,
    lineItems: quote.lineItems,
    subtotal: quote.subtotal != null ? String(quote.subtotal) : null,
    discount: quote.discount != null ? String(quote.discount) : null,
    total: quote.total != null ? String(quote.total) : null,
    pdfUrl: quote.pdfUrl,
    validUntil: quote.validUntil ? quote.validUntil.toISOString() : null,
    clientNote: quote.clientNote,
    internalNote: quote.internalNote,
    createdAt: quote.createdAt.toISOString(),
    updatedAt: quote.updatedAt.toISOString(),
    respondedAt: quote.respondedAt ? quote.respondedAt.toISOString() : null,
    followUpSentAt: quote.followUpSentAt ? quote.followUpSentAt.toISOString() : null,
    requestedBy: quote.requestedBy,
    company: quote.company,
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[
          { label: en ? "Quotes" : "Ofertat", href: `${lp}/admin/quotes` },
          { label: quote.quoteNumber },
        ]}
        title={quote.quoteNumber}
        description={quote.contactEmail}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <EmailClientButton
              apiUrl={`/api/admin/quotes/${quote.id}/email-client`}
              label={en ? "Email client" : "Email klientit"}
              className="h-9"
            />
            {quote.pdfUrl ? (
              <a
                href={quote.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-border/60 bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-muted/50"
              >
                <FileText className="h-4 w-4" strokeWidth={2} aria-hidden />
                {en ? "Open PDF" : "Hap PDF"}
              </a>
            ) : null}
          </div>
        }
      />
      <AdminQuoteDetailView quote={model} locale={locale} lp={lp} />
    </div>
  );
}
