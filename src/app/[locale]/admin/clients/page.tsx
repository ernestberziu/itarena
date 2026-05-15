import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { FilterBar } from "@/components/admin/filter-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { AdminClientsTable, type AdminClientRow } from "@/components/admin/admin-clients-table";

export default async function AdminClientsPage({
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
  const q = sp.q?.trim();

  const users = await db.user.findMany({
    where: {
      role: { in: ["CLIENT", "COMPANY_ADMIN"] },
      ...(q
        ? {
            OR: [
              { firstName: { contains: q } },
              { lastName: { contains: q } },
              { email: { contains: q } },
            ],
          }
        : {}),
    },
    include: {
      company: { select: { name: true, tier: true, isApproved: true } },
      _count: { select: { tickets: true, orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows: AdminClientRow[] = users.map((u) => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    isActive: u.isActive,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    company: u.company,
    _count: u._count,
  }));

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title={locale === "sq" ? "Klientët" : "Clients"}
        description={`${users.length} ${locale === "sq" ? "klientë gjithsej" : "clients total"}`}
        toolbar={
          <FilterBar>
            <form method="GET" action={`${lp}/admin/clients`}>
              <input
                name="q"
                defaultValue={q}
                placeholder={locale === "sq" ? "Kërko klient, email, kompani..." : "Search client, email, company..."}
                className="h-8 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full max-w-md"
              />
            </form>
          </FilterBar>
        }
      />

      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title={locale === "sq" ? "Nuk u gjetën klientë" : "No clients found"}
          description={locale === "sq" ? "Provoni të ndryshoni filtrat" : "Try adjusting your filters"}
          action={q ? { label: "Hiq filtrat", href: `${lp}/admin/clients` } : undefined}
        />
      ) : (
        <AdminClientsTable users={rows} locale={locale} />
      )}
    </div>
  );
}
