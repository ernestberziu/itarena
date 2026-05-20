"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Phone,
  Save,
  ShoppingBag,
  Tag,
  Truck,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { AdminStatCard, UserAvatar } from "@/components/admin/users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatDate, formatDateTime, formatPrice } from "@/lib/utils";
import { ORDER_STATUSES, orderStatusLabel } from "@/lib/admin-order-status";
import {
  normalizeOrderItems,
  orderFulfillmentSummary,
  parseFulfillmentItems,
  getLineFulfillmentState,
  lineFulfillmentTotal,
  type OrderLineItem,
} from "@/lib/order-fulfillment";
import {
  buildOrderActivityTimeline,
  buildPendingOrderChanges,
  type OrderAuditLogEntry,
} from "@/lib/order-activity";

export type AdminOrderDetailModel = {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string;
  total: string;
  itemsJson: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryNotes: string | null;
  contactPhone: string;
  staffNotes: string | null;
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
  dispatchedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  user: { firstName: string; lastName: string; email: string; phone: string | null };
  company: { name: string } | null;
};

function DetailCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
      <header className="flex items-center gap-2 border-b border-border/50 bg-muted/20 px-5 py-3">
        <Icon className="h-4 w-4 text-primary" strokeWidth={2} aria-hidden />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function RailSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-border/50 px-4 py-4 last:border-b-0">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" strokeWidth={2} aria-hidden />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function FulfillmentStatusBadge({
  state,
  locale,
}: {
  state: ReturnType<typeof getLineFulfillmentState>;
  locale: string;
}) {
  const en = locale === "en";
  if (state === "full") {
    return (
      <Badge variant="secondary" className="font-normal">
        {en ? "In stock" : "Në stok"}
      </Badge>
    );
  }
  if (state === "unavailable") {
    return (
      <Badge variant="destructive" className="font-normal">
        {en ? "Unavailable" : "Mungon"}
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="border-amber-200 bg-amber-50 font-normal text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
    >
      {en ? "Partial" : "Pjesërisht"}
    </Badge>
  );
}

export function AdminOrderDetailView({
  order,
  locale,
  activityLogs = [],
}: {
  order: AdminOrderDetailModel;
  locale: string;
  activityLogs?: OrderAuditLogEntry[];
}) {
  const en = locale === "en";
  const t = (sq: string, e: string) => (en ? e : sq);
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [status, setStatus] = useState(order.status);
  const [staffNotes, setStaffNotes] = useState(order.staffNotes ?? "");
  const [items, setItems] = useState<OrderLineItem[]>(() => parseFulfillmentItems(order.itemsJson));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStatus(order.status);
    setStaffNotes(order.staffNotes ?? "");
    setItems(parseFulfillmentItems(order.itemsJson));
  }, [order.id, order.status, order.staffNotes, order.itemsJson]);

  const fulfillment = useMemo(() => orderFulfillmentSummary(items), [items]);

  const statusLabel = orderStatusLabel(status, locale);

  const activityItems = useMemo(() => {
    const saved = buildOrderActivityTimeline(activityLogs, order.createdAt, locale);
    const pending = buildPendingOrderChanges(
      {
        status: order.status,
        staffNotes: order.staffNotes,
        itemsJson: order.itemsJson,
        total: order.total,
      },
      { status, staffNotes, items },
      locale
    );
    const merged = [...pending, ...saved];
    merged.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    return merged;
  }, [activityLogs, order, status, staffNotes, items, locale]);

  const motionProps = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.2 } };

  async function saveStaffFields() {
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          staffNotes,
          items: normalizeOrderItems(items),
        }),
      });
      if (!res.ok) throw new Error("patch");
      toast.success(t("Porosia u përditësua", "Order updated"));
      router.refresh();
    } catch {
      toast.error(t("Ruajtja dështoi", "Save failed"));
    } finally {
      setSaving(false);
    }
  }

  function setFulfilledQty(index: number, raw: string) {
    const parsed = raw.trim() === "" ? 0 : Number(raw);
    const nextQty = Number.isNaN(parsed) ? 0 : Math.floor(parsed);
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const fulfilledQty = Math.min(Math.max(0, nextQty), item.quantity);
        return { ...item, fulfilledQty };
      })
    );
  }

  return (
    <div className="space-y-6">
      <motion.section
        {...motionProps}
        className="rounded-2xl border border-border/60 bg-gradient-to-b from-card to-muted/15 p-6 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-3">
            <p className="font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {order.orderNumber}
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {t("Porosi", "Order")} · {order.user.firstName} {order.user.lastName}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <OrderStatusBadge status={status} locale={locale} />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            <span>
              {t("Krijuar", "Created")} {formatDate(new Date(order.createdAt))}
            </span>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AdminStatCard
          label={t("Totali i porositur", "Ordered total")}
          value={formatPrice(fulfillment.orderedTotal)}
          icon={ShoppingBag}
        />
        <AdminStatCard
          label={t("Totali i disponueshëm", "Available total")}
          value={formatPrice(fulfillment.fulfilledTotal)}
          icon={ShoppingBag}
          className={fulfillment.hasShortfall ? "ring-amber-300/60" : "ring-primary/15"}
        />
        <AdminStatCard
          label={t("Njësi", "Units")}
          value={`${fulfillment.fulfilledUnits} / ${fulfillment.orderedUnits}`}
          icon={Package}
          className="sm:col-span-2 lg:col-span-1"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <DetailCard title={t("Klienti", "Customer")} icon={User}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <UserAvatar firstName={order.user.firstName} lastName={order.user.lastName} size="lg" />
              <dl className="grid min-w-0 flex-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted-foreground">{t("Emri", "Name")}</dt>
                  <dd className="font-medium">
                    {order.user.firstName} {order.user.lastName}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Email</dt>
                  <dd>
                    <a className="break-all text-primary hover:underline" href={`mailto:${order.user.email}`}>
                      {order.user.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{t("Telefoni", "Phone")}</dt>
                  <dd className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} aria-hidden />
                    {order.contactPhone}
                  </dd>
                </div>
                {order.company ? (
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-muted-foreground">{t("Kompania", "Company")}</dt>
                    <dd className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} aria-hidden />
                      {order.company.name}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </DetailCard>

          <DetailCard title={t("Dorëzimi", "Delivery")} icon={MapPin}>
            <div className="space-y-3 text-sm">
              <p>{order.deliveryAddress}</p>
              <p className="text-muted-foreground">{order.deliveryCity}</p>
              {order.deliveryNotes ? (
                <p className="rounded-lg border border-border/50 bg-muted/15 px-3 py-2 text-muted-foreground">
                  {order.deliveryNotes}
                </p>
              ) : null}
            </div>
          </DetailCard>

          <DetailCard title={t("Artikujt", "Line items")} icon={Package}>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">—</p>
            ) : (
              <>
                {fulfillment.hasShortfall ? (
                  <div className="mb-4 rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2.5 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
                    {t(
                      "Disa artikuj nuk janë plotësisht në stok. Vendosni sasinë e disponueshme për çdo rresht dhe ruajeni porosinë.",
                      "Some items are not fully in stock. Set the available quantity for each line and save the order."
                    )}
                    {fulfillment.unavailableLines > 0 ? (
                      <span className="mt-1 block text-xs opacity-90">
                        {fulfillment.unavailableLines}{" "}
                        {t("artikuj mungojnë", "items unavailable")}
                        {fulfillment.shortLines > 0
                          ? ` · ${fulfillment.shortLines} ${t("pjesërisht", "partial")}`
                          : ""}
                      </span>
                    ) : null}
                  </div>
                ) : null}
                <div className="overflow-x-auto rounded-lg border border-border/60">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                          {t("Produkti", "Product")}
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">
                          {t("Kërkuar", "Requested")}
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">
                          {t("Disponueshëm", "Available")}
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">
                          {t("Statusi", "Status")}
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">
                          {t("Çmimi", "Price")}
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">
                          {t("Totali", "Total")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, i) => {
                        const lineState = getLineFulfillmentState(item);
                        return (
                          <tr
                            key={`${item.sku ?? item.name}-${i}`}
                            className={cn(
                              "border-b last:border-0",
                              lineState === "unavailable" && "bg-red-50/50 dark:bg-red-950/20",
                              lineState === "partial" && "bg-amber-50/40 dark:bg-amber-950/15"
                            )}
                          >
                            <td className="px-3 py-2.5">
                              <p className="font-medium">
                                {en && item.nameEn ? item.nameEn : item.name}
                              </p>
                              {item.sku ? (
                                <p className="font-mono text-xs text-muted-foreground">{item.sku}</p>
                              ) : null}
                            </td>
                            <td className="px-3 py-2.5 text-center tabular-nums">{item.quantity}</td>
                            <td className="px-3 py-2.5">
                              <Input
                                type="number"
                                min={0}
                                max={item.quantity}
                                inputMode="numeric"
                                className="mx-auto h-8 w-20 bg-background text-center tabular-nums"
                                value={item.fulfilledQty ?? item.quantity}
                                onChange={(e) => setFulfilledQty(i, e.target.value)}
                                aria-label={
                                  en
                                    ? `Available quantity for ${item.name}`
                                    : `Sasia e disponueshme për ${item.name}`
                                }
                              />
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <FulfillmentStatusBadge state={lineState} locale={locale} />
                            </td>
                            <td className="px-3 py-2.5 text-right tabular-nums">{formatPrice(item.price)}</td>
                            <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                              {formatPrice(lineFulfillmentTotal(item))}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t bg-muted/20">
                        <td colSpan={5} className="px-3 py-2 text-right text-xs text-muted-foreground">
                          {t("Totali i porositur", "Ordered total")}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                          {formatPrice(fulfillment.orderedTotal)}
                        </td>
                      </tr>
                      <tr className="border-t bg-muted/30">
                        <td colSpan={5} className="px-3 py-2 text-right text-sm font-semibold">
                          {t("Totali i disponueshëm", "Available total")}
                        </td>
                        <td className="px-3 py-2 text-right font-bold tabular-nums">
                          {formatPrice(fulfillment.fulfilledTotal)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}
          </DetailCard>

          <DetailCard title={t("Aktiviteti", "Activity")} icon={Clock}>
            {activityItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("Nuk ka aktivitet ende.", "No activity yet.")}
              </p>
            ) : (
              <ul className="space-y-4 border-l border-border pl-4">
                {activityItems.map((row) => (
                  <li key={row.id} className="relative text-sm">
                    <span
                      className={
                        row.pending
                          ? "absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-dashed border-amber-500 bg-background ring-4 ring-card"
                          : row.tone === "success"
                            ? "absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-card"
                            : row.tone === "accent"
                              ? "absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-amber-500 ring-4 ring-card"
                              : "absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-card"
                      }
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground">{row.title}</span>
                      {row.pending ? (
                        <Badge
                          variant="outline"
                          className="border-amber-200 bg-amber-50 text-[10px] font-normal text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                        >
                          {t("Pa ruajtur", "Unsaved")}
                        </Badge>
                      ) : null}
                    </div>
                    {row.details.map((detail) => (
                      <p key={detail} className="text-sm text-foreground/90">
                        {detail}
                      </p>
                    ))}
                    <p className="text-xs text-muted-foreground">
                      {row.actorName ? `${row.actorName} · ` : ""}
                      {row.pending
                        ? t("Ndryshim lokal", "Local change")
                        : formatDateTime(new Date(row.at))}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </DetailCard>
        </div>

        <aside className="lg:sticky lg:top-4 lg:self-start">
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card to-muted/10 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]"
          >
            <header className="border-b border-border/50 px-4 py-4">
              <h3 className="text-sm font-semibold tracking-tight">{t("Veprime stafi", "Staff actions")}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {t(
                  "Përditësoni statusin, stokun e artikujve dhe shënimet.",
                  "Update status, item availability, and notes."
                )}
              </p>
            </header>

            <RailSection title={t("Statusi", "Status")} icon={Tag}>
              <Select value={status} onValueChange={(v) => v != null && setStatus(v)}>
                <SelectTrigger id="order-status" className="w-full">
                  <SelectValue>{statusLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {orderStatusLabel(s, locale)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </RailSection>

            <RailSection title={t("Shënim i brendshëm", "Internal note")} icon={CheckCircle2}>
              <Textarea
                id="order-staff-notes"
                rows={4}
                className="bg-background text-sm"
                value={staffNotes}
                onChange={(e) => setStaffNotes(e.target.value)}
                placeholder={t("Vetëm për stafin…", "Staff only…")}
              />
            </RailSection>

            <div className="space-y-2 border-t border-border/50 p-4">
              <Button type="button" className="w-full gap-2" disabled={saving} onClick={() => void saveStaffFields()}>
                <Save className="h-4 w-4" strokeWidth={2} aria-hidden />
                {saving ? "…" : t("Ruaj", "Save")}
              </Button>
              {order.user.email ? (
                <Button variant="secondary" className="w-full gap-2" asChild>
                  <a href={`mailto:${order.user.email}`}>
                    <Truck className="h-4 w-4" strokeWidth={2} aria-hidden />
                    {t("Email klientit", "Email client")}
                  </a>
                </Button>
              ) : null}
            </div>
          </motion.div>
        </aside>
      </div>
    </div>
  );
}
