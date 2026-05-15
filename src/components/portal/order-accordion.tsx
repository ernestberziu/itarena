"use client";

import { useState } from "react";
import { ChevronDown, MapPin, Package, Clock, CheckCircle2, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, formatPrice } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  PLACED: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",
  CONFIRMED: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
  DISPATCHED: "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400",
  DELIVERED: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400",
  CANCELLED: "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:text-red-400",
};

interface OrderItem {
  name: string;
  nameEn?: string;
  quantity: number;
  price: number;
  sku?: string;
}

interface OrderAccordionProps {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    subtotal: number;
    items: OrderItem[];
    deliveryAddress: string;
    deliveryCity: string;
    createdAt: Date;
    confirmedAt: Date | null;
    dispatchedAt: Date | null;
    deliveredAt: Date | null;
  };
  locale: string;
  t: Record<string, string>;
}

export function PortalOrderAccordion({ order, locale, t }: OrderAccordionProps) {
  const [expanded, setExpanded] = useState(false);

  const statusStyle = STATUS_STYLES[order.status] ?? "";
  const statusLabel =
    t[`status_${order.status.toLowerCase()}`] ?? order.status;

  const timeline = [
    { label: locale === "sq" ? "Vendosur" : "Placed", date: order.createdAt, icon: Package },
    { label: locale === "sq" ? "Konfirmuar" : "Confirmed", date: order.confirmedAt, icon: CheckCircle2 },
    { label: locale === "sq" ? "Dërguar" : "Dispatched", date: order.dispatchedAt, icon: Truck },
    { label: locale === "sq" ? "Dorëzuar" : "Delivered", date: order.deliveredAt, icon: CheckCircle2 },
  ];

  return (
    <div className="rounded-xl border bg-card overflow-hidden hover:shadow-sm transition-shadow">
      {/* Header */}
      <button
        type="button"
        className="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted/30 transition-colors text-left"
        onClick={() => setExpanded((p) => !p)}
        aria-expanded={expanded}
      >
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
          <span className="font-mono text-sm font-medium text-muted-foreground">{order.orderNumber}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusStyle}`}>
            {statusLabel}
          </span>
          <span className="text-xs text-muted-foreground">
            {order.items.length}{" "}
            {locale === "sq"
              ? order.items.length === 1 ? "artikull" : "artikuj"
              : order.items.length === 1 ? "item" : "items"}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-bold text-sm">{formatPrice(order.total)}</span>
          <ChevronDown
            className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", expanded && "rotate-180")}
            strokeWidth={2}
          />
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t space-y-4 px-5 py-4 bg-muted/10">
          {/* Items table */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              {locale === "sq" ? "Artikujt" : "Items"}
            </p>
            <div className="rounded-lg border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                      {locale === "sq" ? "Produkti" : "Product"}
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">
                      {locale === "sq" ? "Sasi" : "Qty"}
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">
                      {locale === "sq" ? "Çmimi" : "Price"}
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">
                      {locale === "sq" ? "Totali" : "Total"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="px-3 py-2.5">
                        <p className="font-medium">{locale === "en" && item.nameEn ? item.nameEn : item.name}</p>
                        {item.sku && <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>}
                      </td>
                      <td className="px-3 py-2.5 text-center tabular-nums">{item.quantity}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{formatPrice(item.price)}</td>
                      <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                        {formatPrice(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t bg-muted/20">
                    <td colSpan={3} className="px-3 py-2 text-right text-sm font-semibold">
                      {locale === "sq" ? "Total" : "Total"}
                    </td>
                    <td className="px-3 py-2 text-right font-bold tabular-nums">{formatPrice(order.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Delivery + Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {locale === "sq" ? "Adresa e Dorëzimit" : "Delivery Address"}
              </p>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <p>{order.deliveryAddress}</p>
                  <p className="text-muted-foreground">{order.deliveryCity}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {locale === "sq" ? "Rrjedha e Statusit" : "Status Timeline"}
              </p>
              <div className="space-y-1.5">
                {timeline.map((step, i) => {
                  const Icon = step.icon;
                  const done = !!step.date;
                  return (
                    <div key={i} className={cn("flex items-center gap-2 text-xs", done ? "text-foreground" : "text-muted-foreground/50")}>
                      <Icon className={cn("h-3.5 w-3.5 shrink-0", done ? "text-emerald-500" : "text-muted-foreground/30")} strokeWidth={2} />
                      <span className={done ? "font-medium" : ""}>{step.label}</span>
                      {step.date && (
                        <span className="text-muted-foreground ml-auto">{formatDate(step.date)}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground italic">{t.cod_notice}</p>
        </div>
      )}
    </div>
  );
}
