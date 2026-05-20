import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PortalOrderAccordion } from "@/components/portal/order-accordion";
import { parseFulfillmentItems } from "@/lib/order-fulfillment";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/hyr");

  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "orders" });
  const lp = locale === "sq" ? "" : `/${locale}`;

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const ordersWithItems = orders.map((order) => ({
    ...order,
    total: Number(order.total),
    subtotal: Number(order.subtotal),
    parsedItems: parseFulfillmentItems(order.items as string),
  }));

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("title")}
        description={`${orders.length} ${locale === "sq" ? "porosi" : "orders"}`}
      />

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={t("empty")}
          description={t("empty_desc")}
          action={{ label: locale === "sq" ? "Shko te Tregu" : "Go to Marketplace", href: `${lp}/tregu` }}
        />
      ) : (
        <div className="space-y-3">
          {ordersWithItems.map((order) => (
            <PortalOrderAccordion
              key={order.id}
              order={{
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                total: order.total,
                subtotal: order.subtotal,
                items: order.parsedItems,
                deliveryAddress: order.deliveryAddress,
                deliveryCity: order.deliveryCity,
                createdAt: order.createdAt,
                confirmedAt: order.confirmedAt,
                dispatchedAt: order.dispatchedAt,
                deliveredAt: order.deliveredAt,
              }}
              locale={locale}
              t={{
                cod_notice: t("cod_notice"),
                status_placed: t("status_placed"),
                status_confirmed: t("status_confirmed"),
                status_dispatched: t("status_dispatched"),
                status_delivered: t("status_delivered"),
                status_cancelled: t("status_cancelled"),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
