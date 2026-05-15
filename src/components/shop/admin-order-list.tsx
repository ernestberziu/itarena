"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { formatPrice, formatDateTime } from "@/lib/utils";

type OrderStatus = "PLACED" | "CONFIRMED" | "DISPATCHED" | "DELIVERED" | "CANCELLED";

interface OrderItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  deliveryAddress: string;
  deliveryCity: string;
  contactPhone: string;
  deliveryNotes?: string | null;
  staffNotes?: string | null;
  createdAt: Date;
  items: OrderItem[];
  user: { firstName: string; lastName: string; email: string };
}

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  PLACED: { label: "E Vendosur", color: "bg-blue-50 text-blue-700 border-blue-200" },
  CONFIRMED: { label: "E Konfirmuar", color: "bg-amber-50 text-amber-700 border-amber-200" },
  DISPATCHED: { label: "Dërguar", color: "bg-violet-50 text-violet-700 border-violet-200" },
  DELIVERED: { label: "Dorëzuar", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CANCELLED: { label: "Anuluar", color: "bg-red-50 text-red-700 border-red-200" },
};

const statusFlow: Record<OrderStatus, OrderStatus[]> = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["DISPATCHED", "CANCELLED"],
  DISPATCHED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function AdminOrderList({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [staffNotes, setStaffNotes] = useState<Record<string, string>>({});

  async function updateStatus(orderId: string, status: OrderStatus, notes?: string) {
    setLoading(orderId);
    try {
      const res = await fetch("/api/shop/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status, staffNotes: notes }),
      });
      if (res.ok) {
        toast.success(`Statusi u ndryshua: ${statusConfig[status].label}`);
        router.refresh();
      } else {
        toast.error("Gabim");
      }
    } catch {
      toast.error("Gabim");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      {orders.length === 0 ? (
        <div className="rounded-2xl bg-white border border-border/60 shadow-sm p-12 text-center">
          <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-slate-200" />
          <p className="text-muted-foreground">Nuk ka porosi ende.</p>
        </div>
      ) : (
        orders.map((order) => {
          const status = order.status as OrderStatus;
          const cfg = statusConfig[status] ?? statusConfig.PLACED;
          const nextStatuses = statusFlow[status] ?? [];
          const isExpanded = expandedId === order.id;

          return (
            <div
              key={order.id}
              className="admin-card-elevated overflow-hidden rounded-2xl"
            >
              {/* Header */}
              <div
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50/60 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                    <ShoppingBag className="h-5 w-5 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold font-mono text-sm">#{order.orderNumber}</span>
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.user.firstName} {order.user.lastName} · {order.user.email} · {order.deliveryCity} ·{" "}
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-extrabold text-lg">{formatPrice(order.total)}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </div>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <div className="border-t border-border/40 p-5 space-y-5 bg-slate-50/40">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Order items */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                        Artikujt
                      </p>
                      <div className="space-y-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">
                              {item.name} × {item.quantity}
                            </span>
                            <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 flex justify-between font-extrabold">
                          <span>Totali</span>
                          <span>{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery info */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                        Dorëzimi
                      </p>
                      <div className="space-y-1.5 text-sm">
                        <p><span className="text-muted-foreground">Adresa:</span> {order.deliveryAddress}</p>
                        <p><span className="text-muted-foreground">Qyteti:</span> {order.deliveryCity}</p>
                        <p><span className="text-muted-foreground">Telefoni:</span> {order.contactPhone}</p>
                        {order.deliveryNotes && (
                          <p><span className="text-muted-foreground">Shënime:</span> {order.deliveryNotes}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Staff notes */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      Shënime Stafi
                    </p>
                    <textarea
                      value={staffNotes[order.id] ?? order.staffNotes ?? ""}
                      onChange={(e) => setStaffNotes((n) => ({ ...n, [order.id]: e.target.value }))}
                      placeholder="Shënime për stafin..."
                      rows={2}
                      className="w-full rounded-xl border-2 border-border/60 bg-white px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none"
                    />
                  </div>

                  {/* Status actions */}
                  {nextStatuses.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
                      {nextStatuses.map((next) => {
                        const nextCfg = statusConfig[next];
                        return (
                          <button
                            key={next}
                            onClick={() => updateStatus(order.id, next, staffNotes[order.id])}
                            disabled={loading === order.id}
                            className={`rounded-xl border-2 px-4 py-2 text-xs font-bold transition-all disabled:opacity-50 ${nextCfg.color} hover:opacity-80`}
                          >
                            {loading === order.id ? "Duke u ndryshuar..." : `→ ${nextCfg.label}`}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
