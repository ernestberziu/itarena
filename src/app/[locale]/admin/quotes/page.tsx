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
import { ADMIN_LIST_PAGE_SIZE } from "@/lib/admin-list-pagination";
import { adminListShellClassName } from "@/lib/admin-list-ui";
import { adminQuotesListWhere, mapQuoteToAdminRow } from "@/lib/admin-quotes-list-dto";
import { getAdminUiT } from "@/lib/i18n/ui-t-server";

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
  const tUi = await getAdminUiT(locale);
  const statusFilter = sp.status;
  const q = sp.q?.trim();

  const listWhere = adminQuotesListWhere({ q, status: statusFilter });
  const filterQueryParts = new URLSearchParams();
  if (q) filterQueryParts.set("q", q);
  if (statusFilter && QUOTE_STATUSES.includes(statusFilter)) filterQueryParts.set("status", statusFilter);
  const filterQuery = filterQueryParts.toString();

  const now = new Date();

  const [
    quotes,
    filteredTotal,
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
      take: ADMIN_LIST_PAGE_SIZE,
      skip: 0,
    }),
    db.quote.count({ where: listWhere }),
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
    { href: filterHref(null), label: tUi("all"), value: null as string | null },
    ...QUOTE_STATUSES.map((s) => ({
      href: filterHref(s),
      label: STATUS_LABELS[s]?.[locale as "sq" | "en"] ?? s,
      value: s,
      inactiveClassName: QUOTE_QUICK_FILTER_TONE[s],
    })),
  ];

  const initialQuotes = quotes.map(mapQuoteToAdminRow);

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
        title={tUi("quotes")}
        description={tUi("quotes_page_desc", {
          filtered: filteredTotal,
          total: totalQuotes,
        })}
        actions={
          <Button size="sm" asChild>
            <Link href={`${lp}/kerko-oferte`}>
              <Plus className="mr-1.5 h-4 w-4" strokeWidth={2} />
              {tUi("new_quote")}
            </Link>
          </Button>
        }
        toolbar={
          <AdminListToolbar>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
              <AdminListToolbarSearch
                action={`${lp}/admin/quotes`}
                placeholder={tUi("search_by_number_or_title")}
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
              title={tUi("status")}
              chips={quoteFilterChips}
              activeValue={activeStatus}
              ariaLabel={tUi("filter_quotes_by_status")}
            />
          </AdminListToolbar>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <AdminStatCard
          label={tUi("total_2")}
          value={totalQuotes}
          icon={FileText}
        />
        <AdminStatCard
          label={tUi("pending")}
          value={pendingQuotes}
          icon={Clock}
        />
        <AdminStatCard
          label={tUi("approved_4")}
          value={approvedQuotes}
          icon={TrendingUp}
        />
        <AdminStatCard
          label={tUi("revenue_potential")}
          value={formatPrice(revenuePotential)}
          icon={BarChart2}
        />
        <AdminStatCard
          label={tUi("expired")}
          value={expiredQuotes}
          icon={AlertCircle}
        />
        <AdminStatCard
          label={tUi("conversion")}
          value={conversionPct != null ? `${conversionPct}%` : "—"}
          icon={Percent}
        />
      </div>

      {filteredTotal === 0 ? (
        <EmptyState
          icon={FileText}
          className="rounded-2xl border border-border/50 bg-card/40 py-16"
          title={
            hasActiveFilters
              ? tUi("no_quotes_match")
              : tUi("no_quotes_yet")
          }
          description={
            hasActiveFilters
              ? tUi("try_adjusting_search_or_filters")
              : tUi("create_the_first_quote_using_the_button_above")
          }
          action={
            hasActiveFilters
              ? { label: tUi("clear_filters_2"), href: baseListHref }
              : { label: tUi("new_quote"), href: `${lp}/kerko-oferte` }
          }
        />
      ) : (
        <div className={adminListShellClassName}>
          <AdminQuotesTable
            initialQuotes={initialQuotes}
            totalCount={filteredTotal}
            pageSize={ADMIN_LIST_PAGE_SIZE}
            locale={locale}
            lp={lp}
            filterQuery={filterQuery}
          />
        </div>
      )}
    </div>
  );
}
