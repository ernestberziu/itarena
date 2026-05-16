import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertCircle, BarChart2, Clock, FileText, Percent, Plus, TrendingUp } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminListToolbar,
  AdminListToolbarClear,
  AdminListToolbarSearch,
} from "@/components/admin/admin-list-toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  AdminQuotesTable,
  type AdminQuoteRow,
} from "@/components/admin/admin-quotes-table";
import { QUOTE_STATUSES, STATUS_LABELS } from "@/lib/admin-quote-status";
import {
  AdminQuickFilterChips,
  QUOTE_QUICK_FILTER_TONE,
} from "@/components/admin/admin-quick-filter-chips";
import { AdminStatCard } from "@/components/admin/users";
import { formatPrice } from "@/lib/utils";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";

export default async function AdminQuotesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/hyr");

  const { locale } = await params;
  const acl = await getCachedEffectiveAcl(session.user.id);
  if (!acl) redirect("/hyr");
  requireAdminPageRead(locale, acl, "quotes");

  const sp = await searchParams;
  const lp = locale === "sq" ? "" : `/${locale}`;
  const en = locale === "en";
  const t = (sq: string, e: string) => (en ? e : sq);
  const statusFilter = sp.status;
  const q = sp.q?.trim();

  const listWhere = {
    ...(statusFilter && QUOTE_STATUSES.includes(statusFilter) ? { status: statusFilter } : {}),
    ...(q ? { OR: [{ quoteNumber: { contains: q } }, { title: { contains: q } }] } : {}),
  };

  const now = new Date();

  const [
    quotes,
    totalQuotes,
    pendingQuotes,
    approvedQuotes,
    rejectedQuotes,
    expiredQuotes,
    pipelineSum,
  ] = await Promise.all([
    db.quote.findMany({
      where: listWhere,
      orderBy: { createdAt: "desc" },
      include: {
        requestedBy: { select: { firstName: true, lastName: true } },
        company: { select: { name: true } },
      },
    }),
    db.quote.count(),
    db.quote.count({ where: { status: "PENDING" } }),
    db.quote.count({ where: { status: "ACCEPTED" } }),
    db.quote.count({ where: { status: "REJECTED" } }),
    db.quote.count({
      where: {
        validUntil: { lt: now },
        status: { notIn: ["ACCEPTED", "REJECTED"] },
      },
    }),
    db.quote.aggregate({
      where: {
        status: { not: "REJECTED" },
        total: { not: null },
      },
      _sum: { total: true },
    }),
  ]);

  function filterHref(s: string | null) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (s) p.set("status", s);
    return `${lp}/admin/quotes?${p.toString()}`;
  }

  const baseListHref = `${lp}/admin/quotes`;
  const hasActiveFilters = Boolean(q || (statusFilter && QUOTE_STATUSES.includes(statusFilter)));
  const activeStatus =
    statusFilter && QUOTE_STATUSES.includes(statusFilter) ? statusFilter : null;

  const quoteFilterChips = [
    { href: filterHref(null), label: t("Të gjitha", "All"), value: null as string | null },
    ...QUOTE_STATUSES.map((s) => ({
      href: filterHref(s),
      label: STATUS_LABELS[s]?.[locale as "sq" | "en"] ?? s,
      value: s,
      inactiveClassName: QUOTE_QUICK_FILTER_TONE[s],
    })),
  ];

  const rows: AdminQuoteRow[] = quotes.map((quote) => ({
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
  }));

  /** Conversion = accepted / (accepted + rejected) — pipeline win rate on closed decisions. */
  const conversionPct =
    approvedQuotes + rejectedQuotes > 0
      ? Math.round((approvedQuotes / (approvedQuotes + rejectedQuotes)) * 1000) / 10
      : null;
  /** Revenue potential = sum of `total` for quotes whose status is not REJECTED (excludes lost deals). */
  const revenuePotential = Number(pipelineSum._sum.total ?? 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("Ofertat", "Quotes")}
        description={t(
          `${quotes.length} oferta në këtë pamje · ${totalQuotes} gjithsej`,
          `${quotes.length} quotes in this view · ${totalQuotes} total`
        )}
        actions={
          <Button size="sm" asChild>
            <Link href={`${lp}/kerko-oferte`}>
              <Plus className="mr-1.5 h-4 w-4" strokeWidth={2} />
              {t("Ofertë e re", "New quote")}
            </Link>
          </Button>
        }
        toolbar={
          <AdminListToolbar>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
              <AdminListToolbarSearch
                action={`${lp}/admin/quotes`}
                placeholder={t("Kërko sipas numrit ose titullit…", "Search by number or title…")}
                defaultQuery={q}
                hiddenFields={
                  statusFilter && QUOTE_STATUSES.includes(statusFilter)
                    ? { status: statusFilter }
                    : undefined
                }
                submitLabelSq="Kërko"
                submitLabelEn="Search"
                locale={locale}
              />
              <AdminListToolbarClear
                href={baseListHref}
                labelSq="Pastro filtrat"
                labelEn="Clear filters"
                locale={locale}
                visible={hasActiveFilters}
              />
            </div>
            <AdminQuickFilterChips
              title={t("Statusi", "Status")}
              chips={quoteFilterChips}
              activeValue={activeStatus}
              ariaLabel={t("Filtro sipas statusit të ofertës", "Filter quotes by status")}
            />
          </AdminListToolbar>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <AdminStatCard
          label={t("Gjithsej", "Total")}
          value={totalQuotes}
          icon={FileText}
        />
        <AdminStatCard
          label={t("Në pritje", "Pending")}
          value={pendingQuotes}
          icon={Clock}
        />
        <AdminStatCard
          label={t("Të pranuara", "Approved")}
          value={approvedQuotes}
          icon={TrendingUp}
        />
        <AdminStatCard
          label={t("Potenciali", "Revenue potential")}
          value={formatPrice(revenuePotential)}
          icon={BarChart2}
        />
        <AdminStatCard
          label={t("Skaduar", "Expired")}
          value={expiredQuotes}
          icon={AlertCircle}
        />
        <AdminStatCard
          label={t("Konvertimi", "Conversion")}
          value={conversionPct != null ? `${conversionPct}%` : "—"}
          icon={Percent}
        />
      </div>

      {quotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          className="rounded-2xl border border-border/50 bg-card/40 py-16"
          title={
            hasActiveFilters
              ? t("Nuk u gjetën oferta", "No quotes match")
              : t("Nuk ka oferta ende", "No quotes yet")
          }
          description={
            hasActiveFilters
              ? t("Provo të ndryshosh kërkimin ose filtrat.", "Try adjusting search or filters.")
              : t("Krijo ofertën e parë nga butoni më sipër.", "Create the first quote using the button above.")
          }
          action={
            hasActiveFilters
              ? { label: t("Pastro filtrat", "Clear filters"), href: baseListHref }
              : { label: t("Ofertë e re", "New quote"), href: `${lp}/kerko-oferte` }
          }
        />
      ) : (
        <AdminQuotesTable quotes={rows} locale={locale} lp={lp} />
      )}
    </div>
  );
}
