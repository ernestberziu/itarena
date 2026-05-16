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
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";

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

  const [users, totalCount, activeCount, suspendedCount, newCount] = await Promise.all([
    db.user.findMany({
      where,
      include: {
        company: { select: { name: true, tier: true, isApproved: true } },
        _count: { select: { tickets: true, orders: true } },
      },
      orderBy: { createdAt: "desc" },
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

  const rows: AdminClientRow[] = users.map((u) => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    isActive: u.isActive,
    emailVerified: u.emailVerified?.toISOString() ?? null,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
    company: u.company,
    _count: u._count,
  }));

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

      {users.length === 0 ? (
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
        <AdminClientsTable users={rows} locale={locale} lp={lp} />
      )}
    </div>
  );
}
