import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { subDays } from "date-fns";
import { Users, UserCheck, UserX, Sparkles } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { FilterBar } from "@/components/admin/filter-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { AdminClientsTable, type AdminClientRow } from "@/components/admin/admin-clients-table";
import { AdminStatCard, AdminUsersToolbar } from "@/components/admin/users";
import { adminClientsListWhere } from "@/lib/admin-clients-list-where";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { hasAclLevel } from "@/lib/admin-acl/features";
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";
import { ADMIN_LIST_PAGE_SIZE } from "@/lib/admin-list-pagination";
import { mapClientToAdminRow } from "@/lib/admin-clients-list-dto";

export default async function AdminClientsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/hyr");
  const userId = session.user.id;

  const { locale } = await params;
  const acl = await getCachedEffectiveAcl(userId);
  if (!acl) redirect("/hyr");
  requireAdminPageRead(locale, acl, "clients");
  const canMessage = hasAclLevel(acl, "messages", "write");

  const sp = await searchParams;
  const lp = locale === "sq" ? "" : `/${locale}`;
  const q = sp.q?.trim();
  const tier = sp.tier?.trim();
  const approved = sp.approved?.trim();
  const active = sp.active?.trim() || "all";

  const where = adminClientsListWhere({
    q,
    tier: tier || undefined,
    approved: approved || undefined,
    active: active || undefined,
  });

  const thirtyDaysAgo = subDays(new Date(), 30);

  const filterQueryParts = new URLSearchParams();
  if (q) filterQueryParts.set("q", q);
  if (tier) filterQueryParts.set("tier", tier);
  if (approved) filterQueryParts.set("approved", approved);
  if (active && active !== "all") filterQueryParts.set("active", active);
  const filterQuery = filterQueryParts.toString();

  const [users, totalCount, activeCount, suspendedCount, newCount] = await Promise.all([
    db.user.findMany({
      where,
      include: {
        company: { select: { name: true, tier: true, isApproved: true } },
        _count: { select: { tickets: true, orders: true } },
      },
      orderBy: { createdAt: "desc" },
      take: ADMIN_LIST_PAGE_SIZE,
      skip: 0,
    }),
    db.user.count({ where }),
    db.user.count({ where: { ...where, isActive: true } }),
    db.user.count({ where: { ...where, isActive: false } }),
    db.user.count({
      where: {
        ...where,
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
  ]);

  const initialClients = users.map(mapClientToAdminRow);

  const hasFilters = Boolean(q || tier || approved || (active && active !== "all"));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={locale === "sq" ? "Klientët" : "Clients"}
        description={
          locale === "sq"
            ? "Menaxho llogaritë e portalit dhe kompanitë B2B."
            : "Manage portal accounts and B2B companies."
        }
        toolbar={
          <FilterBar className="rounded-2xl border-border/40 bg-muted/10 p-3 shadow-sm ring-1 ring-black/[0.02] dark:ring-white/[0.04]">
            <AdminUsersToolbar
              locale={locale}
              lp={lp}
              q={q}
              tier={tier}
              approved={approved}
              active={active}
            />
          </FilterBar>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <AdminStatCard
          label={locale === "sq" ? "Gjithsej" : "Total"}
          value={totalCount}
          icon={Users}
        />
        <AdminStatCard
          label={locale === "sq" ? "Aktive" : "Active"}
          value={activeCount}
          icon={UserCheck}
        />
        <AdminStatCard
          label={locale === "sq" ? "Të pezulluara" : "Suspended"}
          value={suspendedCount}
          icon={UserX}
        />
        <AdminStatCard
          label={locale === "sq" ? "Të reja (30 ditë)" : "New (30d)"}
          value={newCount}
          icon={Sparkles}
        />
      </div>

      {totalCount === 0 ? (
        <EmptyState
          icon={Users}
          title={locale === "sq" ? "Nuk u gjetën klientë" : "No clients found"}
          description={
            locale === "sq" ? "Provoni të ndryshoni filtrat ose kërkimin." : "Try adjusting filters or search."
          }
          action={
            hasFilters
              ? {
                  label: locale === "sq" ? "Hiq filtrat" : "Clear filters",
                  href: `${lp}/admin/clients`,
                }
              : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.06]">
          <AdminClientsTable
            initialClients={initialClients}
            totalCount={totalCount}
            pageSize={ADMIN_LIST_PAGE_SIZE}
            locale={locale}
            lp={lp}
            filterQuery={filterQuery}
            currentUserId={userId}
            canMessage={canMessage}
          />
        </div>
      )}
    </div>
  );
}
