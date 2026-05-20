import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminCompanyDetailView } from "@/components/admin/admin-company-detail-view";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { hasAclLevel } from "@/lib/admin-acl/features";
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";
import type { AdminCompanyDetail } from "@/types/admin-company";

export default async function AdminCompanyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/hyr");

  const { locale, id } = await params;
  const acl = await getCachedEffectiveAcl(session.user.id);
  if (!acl) redirect("/hyr");
  requireAdminPageRead(locale, acl, "companies");
  const canMessage = hasAclLevel(acl, "messages", "write");

  const lp = locale === "sq" ? "" : `/${locale}`;

  const company = await db.company.findUnique({
    where: { id },
    include: {
      _count: { select: { users: true, tickets: true, orders: true, quotes: true } },
      users: {
        where: { role: { in: ["CLIENT", "COMPANY_ADMIN"] } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          isActive: true,
          lastLoginAt: true,
          role: true,
        },
        orderBy: { createdAt: "asc" },
      },
      tickets: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, number: true, title: true, status: true, createdAt: true },
      },
      orders: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, orderNumber: true, status: true, total: true, createdAt: true },
      },
    },
  });

  if (!company) notFound();

  const model: AdminCompanyDetail = {
    id: company.id,
    name: company.name,
    vatNumber: company.vatNumber,
    address: company.address,
    city: company.city,
    country: company.country,
    tier: company.tier,
    isApproved: company.isApproved,
    notes: company.notes,
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString(),
    _count: company._count,
    members: company.users.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      isActive: u.isActive,
      lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
      role: u.role,
    })),
    recentTickets: company.tickets.map((t) => ({
      id: t.id,
      number: t.number,
      title: t.title,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
    })),
    recentOrders: company.orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      total: String(o.total),
      createdAt: o.createdAt.toISOString(),
    })),
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[
          { label: locale === "sq" ? "Kompanitë" : "Companies", href: `${lp}/admin/companies` },
          { label: company.name },
        ]}
        title={company.name}
        description={company.vatNumber ?? undefined}
        actions={
          <Link
            href={`${lp}/admin/companies`}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {locale === "sq" ? "← Kompanitë" : "← Companies"}
          </Link>
        }
      />
      <AdminCompanyDetailView
        company={model}
        locale={locale}
        lp={lp}
        currentUserId={session.user.id}
        canMessage={canMessage}
      />
    </div>
  );
}
