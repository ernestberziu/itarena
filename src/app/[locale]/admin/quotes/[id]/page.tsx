import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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
        title={quote.title}
        description={`${quote.quoteNumber} · ${quote.contactName}`}
        actions={
          <Link
            href={`${lp}/admin/quotes`}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {en ? "← Back to quotes" : "← Kthehu te ofertat"}
          </Link>
        }
      />
      <AdminQuoteDetailView quote={model} locale={locale} lp={lp} />
    </div>
  );
}
