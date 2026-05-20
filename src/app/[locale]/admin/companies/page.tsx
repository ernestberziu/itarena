import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, Plus, ShoppingBag, Ticket, Users } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { FilterBar } from "@/components/admin/filter-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { AdminCompaniesTable } from "@/components/admin/admin-companies-table";
import { AdminCompaniesToolbar } from "@/components/admin/admin-companies-toolbar";
import { AdminStatCard } from "@/components/admin/users";
import { adminCompaniesListWhere } from "@/lib/admin-companies-list-where";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";
import { ADMIN_LIST_PAGE_SIZE } from "@/lib/admin-list-pagination";
import { mapCompanyToAdminRow } from "@/lib/admin-companies-list-dto";

export default async function AdminCompaniesPage({
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
  requireAdminPageRead(locale, acl, "companies");

  const sp = await searchParams;
  const lp = locale === "sq" ? "" : `/${locale}`;
  const q = sp.q?.trim();

  const where = adminCompaniesListWhere({ q });

  const filterQueryParts = new URLSearchParams();
  if (q) filterQueryParts.set("q", q);
  const filterQuery = filterQueryParts.toString();

  const [companies, totalCount, memberLinks, ticketCount, orderCount] = await Promise.all([
    db.company.findMany({
      where,
      include: { _count: { select: { users: true, tickets: true, orders: true } } },
      orderBy: { createdAt: "desc" },
      take: ADMIN_LIST_PAGE_SIZE,
      skip: 0,
    }),
    db.company.count({ where }),
    db.user.count({ where: { companyId: { not: null } } }),
    db.ticket.count({ where: { companyId: { not: null } } }),
    db.order.count({ where: { companyId: { not: null } } }),
  ]);

  const initialCompanies = companies.map(mapCompanyToAdminRow);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={locale === "sq" ? "Kompanitë" : "Companies"}
        description={
          locale === "sq"
            ? "Menaxho kompanitë B2B dhe lidh klientët me to."
            : "Manage B2B companies and link clients to them."
        }
        actions={
          <Link
            href={`${lp}/admin/companies/new`}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            {locale === "sq" ? "Kompani e re" : "New company"}
          </Link>
        }
        toolbar={
          <FilterBar className="rounded-2xl border-border/40 bg-muted/10 p-3 shadow-sm ring-1 ring-black/[0.02] dark:ring-white/[0.04]">
            <AdminCompaniesToolbar locale={locale} lp={lp} q={q} />
          </FilterBar>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <AdminStatCard label={locale === "sq" ? "Gjithsej" : "Total"} value={String(totalCount)} icon={Building2} />
        <AdminStatCard label={locale === "sq" ? "Klientë të lidhur" : "Linked clients"} value={String(memberLinks)} icon={Users} />
        <AdminStatCard label={locale === "sq" ? "Bileta" : "Tickets"} value={String(ticketCount)} icon={Ticket} />
        <AdminStatCard label={locale === "sq" ? "Porosi" : "Orders"} value={String(orderCount)} icon={ShoppingBag} />
      </div>

      {totalCount === 0 && !q ? (
        <EmptyState
          icon={Building2}
          title={locale === "sq" ? "Asnjë kompani" : "No companies"}
          description={
            locale === "sq"
              ? "Krijo kompaninë e parë për të lidhur klientët."
              : "Create your first company to link clients."
          }
          action={{ label: locale === "sq" ? "Krijo kompani" : "Create company", href: `${lp}/admin/companies/new` }}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.06]">
          <AdminCompaniesTable
            initialCompanies={initialCompanies}
            totalCount={totalCount}
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
