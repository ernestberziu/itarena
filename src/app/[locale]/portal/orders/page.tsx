import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ShoppingBag } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PortalOrdersTable } from "@/components/portal/tables/portal-orders-table";
import type { PortalOrderRow } from "@/components/portal/tables/portal-order-detail-panel";
import { parseFulfillmentItems } from "@/lib/order-fulfillment";
import { portalOrderWhere, portalUsesCompanyScope } from "@/lib/portal/scope";
import { portalUser } from "@/lib/portal/access";
import { adminListShellClassName } from "@/lib/admin-list-ui";

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/hyr");

  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "orders" });
  const tPortal = await getTranslations({ locale, namespace: "portal" });

  const user = portalUser(session);
  const companyScope = portalUsesCompanyScope(user);

  const orders = await db.order.findMany({
    where: portalOrderWhere(user),
    orderBy: { createdAt: "desc" },
    include: { user: { select: { firstName: true, lastName: true } } },
  });

  const rows: PortalOrderRow[] = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    total: Number(order.total),
    subtotal: Number(order.subtotal),
    items: parseFulfillmentItems(order.items as string),
    deliveryAddress: order.deliveryAddress,
    deliveryCity: order.deliveryCity,
    createdAt: order.createdAt.toISOString(),
    confirmedAt: order.confirmedAt?.toISOString() ?? null,
    dispatchedAt: order.dispatchedAt?.toISOString() ?? null,
    deliveredAt: order.deliveredAt?.toISOString() ?? null,
    user: order.user,
  }));

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title={t("title")}
        description={
          companyScope
            ? `${orders.length} ${locale === "sq" ? "porosi" : "orders"} · ${tPortal("company_scope_hint")}`
            : `${orders.length} ${locale === "sq" ? "porosi" : "orders"}`
        }
      />

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={t("empty")}
          description={t("empty_desc")}
          action={{ label: locale === "sq" ? "Shko te Tregu" : "Go to Shop", href: "/shop" }}
        />
      ) : (
        <div className={adminListShellClassName}>
          <PortalOrdersTable
            rows={rows}
            locale={locale}
            companyScope={companyScope}
            codNotice={t("cod_notice")}
          />
        </div>
      )}
    </div>
  );
}
