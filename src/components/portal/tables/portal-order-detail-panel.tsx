"use client";

import { MapPin, Package, CheckCircle2, Truck } from "lucide-react";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import {
  getFulfilledQty,
  getLineFulfillmentState,
  lineFulfillmentTotal,
  orderFulfillmentSummary,
  type OrderLineItem,
} from "@/lib/order-fulfillment";

export type PortalOrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  items: OrderLineItem[];
  deliveryAddress: string;
  deliveryCity: string;
  createdAt: string;
  confirmedAt: string | null;
  dispatchedAt: string | null;
  deliveredAt: string | null;
  user: { firstName: string; lastName: string };
};

export function PortalOrderDetailPanel({
  order,
  locale,
  codNotice,
}: {
  order: PortalOrderRow;
  locale: string;
  codNotice: string;
}) {
  const fulfillment = orderFulfillmentSummary(order.items);
  const showFulfillment = fulfillment.hasShortfall;

  const timeline = [
    { label: locale === "sq" ? "Vendosur" : "Placed", date: order.createdAt, icon: Package },
    { label: locale === "sq" ? "Konfirmuar" : "Confirmed", date: order.confirmedAt, icon: CheckCircle2 },
    { label: locale === "sq" ? "Dërguar" : "Dispatched", date: order.dispatchedAt, icon: Truck },
    { label: locale === "sq" ? "Dorëzuar" : "Delivered", date: order.deliveredAt, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-4 border-t border-border/60 bg-muted/20 px-5 py-4">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {locale === "sq" ? "Artikujt" : "Items"}
        </p>
        {showFulfillment ? (
          <p className="mb-2 text-xs text-amber-800 dark:text-amber-200">
            {locale === "sq"
              ? "Sasia e konfirmuar nga stafi mund të ndryshojë nga porosia fillestare."
              : "Confirmed quantities may differ from your original order."}
          </p>
        ) : null}
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/45">
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {locale === "sq" ? "Produkti" : "Product"}
                </th>
                <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {showFulfillment
                    ? locale === "sq"
                      ? "Kërkuar"
                      : "Requested"
                    : locale === "sq"
                      ? "Sasi"
                      : "Qty"}
                </th>
                {showFulfillment ? (
                  <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {locale === "sq" ? "Konfirmuar" : "Confirmed"}
                  </th>
                ) : null}
                <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {locale === "sq" ? "Çmimi" : "Price"}
                </th>
                <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {locale === "sq" ? "Totali" : "Total"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {order.items.map((item, i) => {
                const fulfilled = getFulfilledQty(item);
                const lineState = getLineFulfillmentState(item);
                return (
                  <tr
                    key={i}
                    className={cn(
                      lineState === "unavailable" && "bg-red-50/40 dark:bg-red-950/20",
                      lineState === "partial" && "bg-amber-50/30 dark:bg-amber-950/15"
                    )}
                  >
                    <td className="px-3 py-2.5">
                      <p className="font-medium">{locale === "en" && item.nameEn ? item.nameEn : item.name}</p>
                      {item.sku ? <p className="font-mono text-xs text-muted-foreground">{item.sku}</p> : null}
                      {lineState === "unavailable" ? (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          {locale === "sq" ? "Nuk disponohet" : "Not available"}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5 text-center tabular-nums">{item.quantity}</td>
                    {showFulfillment ? (
                      <td className="px-3 py-2.5 text-center tabular-nums font-medium">{fulfilled}</td>
                    ) : null}
                    <td className="px-3 py-2.5 text-right tabular-nums">{formatPrice(item.price)}</td>
                    <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                      {formatPrice(showFulfillment ? lineFulfillmentTotal(item) : item.price * item.quantity)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              {showFulfillment ? (
                <tr className="border-t border-border/60 bg-muted/10">
                  <td colSpan={showFulfillment ? 4 : 3} className="px-3 py-2 text-right text-xs text-muted-foreground">
                    {locale === "sq" ? "Totali i porositur" : "Ordered total"}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {formatPrice(fulfillment.orderedTotal)}
                  </td>
                </tr>
              ) : null}
              <tr className="border-t border-border/60 bg-muted/20">
                <td colSpan={showFulfillment ? 4 : 3} className="px-3 py-2 text-right text-sm font-semibold">
                  {showFulfillment
                    ? locale === "sq"
                      ? "Totali i konfirmuar"
                      : "Confirmed total"
                    : locale === "sq"
                      ? "Total"
                      : "Total"}
                </td>
                <td className="px-3 py-2 text-right font-bold tabular-nums">
                  {formatPrice(showFulfillment ? fulfillment.fulfilledTotal : order.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {locale === "sq" ? "Adresa e Dorëzimit" : "Delivery Address"}
          </p>
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2} />
            <div>
              <p>{order.deliveryAddress}</p>
              <p className="text-muted-foreground">{order.deliveryCity}</p>
            </div>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {locale === "sq" ? "Rrjedha e Statusit" : "Status Timeline"}
          </p>
          <div className="space-y-1.5">
            {timeline.map((step, i) => {
              const Icon = step.icon;
              const done = !!step.date;
              return (
                <div
                  key={i}
                  className={cn("flex items-center gap-2 text-xs", done ? "text-foreground" : "text-muted-foreground/50")}
                >
                  <Icon
                    className={cn("h-3.5 w-3.5 shrink-0", done ? "text-emerald-500" : "text-muted-foreground/30")}
                    strokeWidth={2}
                  />
                  <span className={done ? "font-medium" : ""}>{step.label}</span>
                  {step.date ? (
                    <span className="ml-auto text-muted-foreground">{formatDate(new Date(step.date))}</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-xs italic text-muted-foreground">{codNotice}</p>
    </div>
  );
}
