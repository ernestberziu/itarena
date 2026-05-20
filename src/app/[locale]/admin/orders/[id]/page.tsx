import { notFound, redirect } from "next/navigation";
import { Mail } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminOrderDetailView,
  type AdminOrderDetailModel,
} from "@/components/admin/admin-order-detail-view";
import type { OrderAuditLogEntry } from "@/lib/order-activity";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/hyr");

  const { locale, id } = await params;
  const acl = await getCachedEffectiveAcl(session.user.id);
  if (!acl) redirect("/hyr");
  requireAdminPageRead(locale, acl, "orders");

  const lp = locale === "sq" ? "" : `/${locale}`;
  const en = locale === "en";

  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true } },
      company: { select: { name: true } },
    },
  });

  if (!order) notFound();

  const auditLogs = await db.auditLog.findMany({
    where: { resource: "Order", resourceId: id },
    orderBy: { createdAt: "desc" },
    include: {
      actor: { select: { firstName: true, lastName: true } },
    },
  });

  const activityLogs: OrderAuditLogEntry[] = auditLogs.map((log) => ({
    id: log.id,
    action: log.action,
    metadata: log.metadata,
    createdAt: log.createdAt.toISOString(),
    actor: log.actor,
  }));

  const model: AdminOrderDetailModel = {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    subtotal: String(order.subtotal),
    total: String(order.total),
    itemsJson: order.items,
    deliveryAddress: order.deliveryAddress,
    deliveryCity: order.deliveryCity,
    deliveryNotes: order.deliveryNotes,
    contactPhone: order.contactPhone,
    staffNotes: order.staffNotes,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    confirmedAt: order.confirmedAt ? order.confirmedAt.toISOString() : null,
    dispatchedAt: order.dispatchedAt ? order.dispatchedAt.toISOString() : null,
    deliveredAt: order.deliveredAt ? order.deliveredAt.toISOString() : null,
    cancelledAt: order.cancelledAt ? order.cancelledAt.toISOString() : null,
    cancelReason: order.cancelReason,
    user: order.user,
    company: order.company,
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[
          { label: en ? "Orders" : "Porositë", href: `${lp}/admin/orders` },
          { label: order.orderNumber },
        ]}
        title={order.orderNumber}
        description={`${order.user.firstName} ${order.user.lastName}`}
        actions={
          <a
            href={`mailto:${order.user.email}`}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border/60 bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-muted/50"
          >
            <Mail className="h-4 w-4" strokeWidth={2} aria-hidden />
            {en ? "Email client" : "Email klientit"}
          </a>
        }
      />
      <AdminOrderDetailView order={model} locale={locale} activityLogs={activityLogs} />
    </div>
  );
}
