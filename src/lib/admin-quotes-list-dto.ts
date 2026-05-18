import { QUOTE_STATUSES } from "@/lib/admin-quote-status";
import type { AdminQuoteRow } from "@/components/admin/admin-quotes-table";

type QuoteDbRow = {
  id: string;
  quoteNumber: string;
  title: string;
  status: string;
  total: unknown;
  createdAt: Date;
  validUntil: Date | null;
  services: string;
  contactName: string;
  contactEmail: string;
  pdfUrl: string | null;
  requestedBy: { firstName: string; lastName: string };
  company: { name: string } | null;
};

export function adminQuotesListWhere(input: {
  q?: string | null;
  status?: string | null;
}) {
  const statusFilter = input.status?.trim();
  const q = input.q?.trim();
  return {
    ...(statusFilter && QUOTE_STATUSES.includes(statusFilter) ? { status: statusFilter } : {}),
    ...(q ? { OR: [{ quoteNumber: { contains: q } }, { title: { contains: q } }] } : {}),
  };
}

export function mapQuoteToAdminRow(quote: QuoteDbRow): AdminQuoteRow {
  return {
    id: quote.id,
    quoteNumber: quote.quoteNumber,
    title: quote.title,
    status: quote.status,
    total: quote.total != null ? String(quote.total) : null,
    createdAt: quote.createdAt.toISOString(),
    validUntil: quote.validUntil ? quote.validUntil.toISOString() : null,
    services: quote.services,
    contactName: quote.contactName,
    contactEmail: quote.contactEmail,
    pdfUrl: quote.pdfUrl,
    requestedBy: quote.requestedBy,
    company: quote.company,
  };
}
