import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { FilterBar } from "@/components/admin/filter-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  AdminQuotesTable,
  type AdminQuoteRow,
} from "@/components/admin/admin-quotes-table";
import { QUOTE_STATUSES, STATUS_LABELS } from "@/lib/admin-quote-status";

export default async function AdminQuotesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await auth();
  if (!session) redirect("/hyr");

  const { locale } = await params;
  const sp = await searchParams;
  const lp = locale === "sq" ? "" : `/${locale}`;
  const statusFilter = sp.status;
  const q = sp.q?.trim();

  const quotes = await db.quote.findMany({
    where: {
      ...(statusFilter && QUOTE_STATUSES.includes(statusFilter) ? { status: statusFilter } : {}),
      ...(q ? { OR: [{ quoteNumber: { contains: q } }, { title: { contains: q } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      requestedBy: { select: { firstName: true, lastName: true } },
      company: { select: { name: true } },
    },
  });

  function filterHref(s: string | null) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (s) p.set("status", s);
    return `${lp}/admin/quotes?${p.toString()}`;
  }

  const rows: AdminQuoteRow[] = quotes.map((quote) => ({
    id: quote.id,
    quoteNumber: quote.quoteNumber,
    title: quote.title,
    status: quote.status,
    total: quote.total != null ? String(quote.total) : null,
    createdAt: quote.createdAt.toISOString(),
    requestedBy: quote.requestedBy,
    company: quote.company,
  }));

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title={locale === "sq" ? "Ofertat" : "Quotes"}
        description={`${quotes.length} ${locale === "sq" ? "oferta" : "quotes"}`}
        toolbar={
          <FilterBar>
            <form method="GET" action={`${lp}/admin/quotes`}>
              <input
                name="q"
                defaultValue={q}
                placeholder={locale === "sq" ? "Kërko ofertë..." : "Search quotes..."}
                className="h-8 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-52"
              />
              {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
            </form>
            <div className="flex flex-wrap gap-1">
              {[null, ...QUOTE_STATUSES].map((s) => {
                const label = s ? (STATUS_LABELS[s]?.[locale as "sq" | "en"] ?? s) : locale === "sq" ? "Të gjitha" : "All";
                return (
                  <Link key={s ?? "all"} href={filterHref(s)}>
                    <Badge
                      variant={statusFilter === s || (!statusFilter && !s) ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                    >
                      {label}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </FilterBar>
        }
      />

      {quotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={locale === "sq" ? "Nuk u gjetën oferta" : "No quotes found"}
          description={locale === "sq" ? "Nuk ka oferta ende" : "No quotes yet"}
        />
      ) : (
        <AdminQuotesTable quotes={rows} locale={locale} />
      )}
    </div>
  );
}
