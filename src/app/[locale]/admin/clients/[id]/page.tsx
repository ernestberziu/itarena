import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminClientDetailView,
  type AdminClientDetailModel,
} from "@/components/admin/admin-client-detail-view";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { hasAclLevel } from "@/lib/admin-acl/features";
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/hyr");

  const { locale, id } = await params;
  const acl = await getCachedEffectiveAcl(session.user.id);
  if (!acl) redirect("/hyr");
  requireAdminPageRead(locale, acl, "clients");
  const canMessage = hasAclLevel(acl, "messages", "write");

  const lp = locale === "sq" ? "" : `/${locale}`;

  const user = await db.user.findFirst({
    where: { id, role: { in: ["CLIENT", "COMPANY_ADMIN"] } },
    include: {
      company: {
        select: {
          name: true,
          tier: true,
          isApproved: true,
          vatNumber: true,
          city: true,
          country: true,
        },
      },
      _count: { select: { tickets: true, orders: true, quotes: true } },
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

  if (!user) notFound();

  const model: AdminClientDetailModel = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    language: user.language,
    isActive: user.isActive,
    emailVerified: user.emailVerified?.toISOString() ?? null,
    twoFactorEnabled: user.twoFactorEnabled,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    role: user.role,
    company: user.company,
    _count: user._count,
    recentTickets: user.tickets.map((t) => ({
      id: t.id,
      number: t.number,
      title: t.title,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
    })),
    recentOrders: user.orders.map((o) => ({
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
          { label: locale === "sq" ? "Klientët" : "Clients", href: `${lp}/admin/clients` },
          { label: `${user.firstName} ${user.lastName}` },
        ]}
        title={`${user.firstName} ${user.lastName}`}
        description={user.email}
        actions={
          <Link
            href={`${lp}/admin/clients`}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {locale === "sq" ? "← Klientët" : "← Clients"}
          </Link>
        }
      />
      <AdminClientDetailView
        user={model}
        locale={locale}
        lp={lp}
        currentUserId={session.user.id}
        canMessage={canMessage}
      />
    </div>
  );
}
