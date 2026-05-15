"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart, Trash2, Plus, Minus, Package,
  Truck, CreditCard, ChevronLeft, CheckCircle2, MapPin, Phone, User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "./cart-context";
import { formatPrice } from "@/lib/utils";
import { shopUrl } from "@/lib/shop-url";

interface CartViewProps {
  isB2b: boolean;
  isLoggedIn: boolean;
}

export function CartView({ isB2b }: CartViewProps) {
  const { items, removeItem, updateQty, clearCart, totalPrice } = useCart();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });
  const [placing, setPlacing] = useState(false);
  const [step, setStep] = useState<"cart" | "checkout">("cart");

  const total = totalPrice(isB2b);

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setPlacing(true);
    try {
      const res = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            sku: item.sku,
            name: item.nameSq,
            quantity: item.quantity,
            price: isB2b ? item.priceB2b : item.priceRetail,
          })),
          customerName: form.name,
          deliveryAddress: form.address,
          deliveryCity: form.city,
          contactPhone: form.phone,
          deliveryNotes: form.notes,
          total,
          isB2b,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        clearCart();
        window.location.assign(shopUrl(`checkout/success/${data.orderNumber}`));
      } else {
        const err = await res.json();
        toast.error(err.error ?? "Ndodhi një gabim. Provoni përsëri.");
      }
    } catch {
      toast.error("Ndodhi një gabim. Provoni përsëri.");
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-100 mb-6">
          <ShoppingCart className="h-12 w-12 text-slate-300" />
        </div>
        <h2 className="text-2xl font-extrabold mb-3">Shporta është bosh</h2>
        <p className="text-muted-foreground mb-8 max-w-sm">
          Shikoni produktet tona dhe shtoni ato që dëshironi në shportë.
        </p>
        <Button asChild>
          <Link href={shopUrl()}>
            <ChevronLeft className="mr-2 h-5 w-5" />
            Shiko Produktet
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold">
              {step === "cart" ? "Shporta Ime" : "Konfirmo Porosinë"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {items.length} artikuj · {formatPrice(total)}
            </p>
          </div>
          {step === "checkout" && (
            <Button
              variant="outline"
              onClick={() => setStep("cart")}
              className="text-sm font-medium"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Kthehu
            </Button>
          )}
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${step === "cart" ? "bg-primary text-white" : "bg-emerald-100 text-emerald-700"}`}>
            {step !== "cart" ? <CheckCircle2 className="h-4 w-4" /> : "1"}
            Shporta
          </div>
          <div className="h-px flex-1 bg-border" />
          <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${step === "checkout" ? "bg-primary text-white" : "bg-slate-100 text-muted-foreground"}`}>
            2 Dorëzimi
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — items or checkout form */}
          <div className="lg:col-span-2 space-y-4">
            {step === "cart" ? (
              <>
                {items.map((item) => {
                  const price = isB2b ? item.priceB2b : item.priceRetail;
                  const image = item.images[0] ?? null;
                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 rounded-2xl bg-white border border-border/60 p-4 shadow-sm"
                    >
                      <div className="relative h-24 w-24 shrink-0 rounded-xl bg-slate-50 overflow-hidden">
                        {image ? (
                          <Image src={image} alt={item.nameSq} fill className="object-contain p-2" sizes="96px" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="h-8 w-8 text-slate-200" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm leading-snug mb-1 truncate">{item.nameSq}</p>
                        <p className="text-xs text-muted-foreground font-mono mb-3">SKU: {item.sku}</p>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center rounded-lg border border-border/60 overflow-hidden">
                            <button
                              type="button"
                              onClick={() => updateQty(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="cursor-pointer select-none px-3 py-2 transition-[background-color,color,transform] duration-200 ease-out hover:bg-slate-100 active:bg-slate-200 motion-safe:active:scale-[0.96] disabled:pointer-events-none disabled:opacity-35 disabled:active:scale-100"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQty(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="cursor-pointer select-none px-3 py-2 transition-[background-color,color,transform] duration-200 ease-out hover:bg-slate-100 active:bg-slate-200 motion-safe:active:scale-[0.96] disabled:pointer-events-none disabled:opacity-35 disabled:active:scale-100"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-base">
                              {formatPrice(price * item.quantity)}
                            </span>
                            {item.quantity > 1 && (
                              <p className="text-xs text-muted-foreground">{formatPrice(price)} / njësi</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="cursor-pointer select-none rounded-lg p-2 text-muted-foreground transition-[background-color,color,transform] duration-200 ease-out hover:bg-destructive/10 hover:text-destructive active:bg-destructive/15 motion-safe:active:scale-[0.96]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <Button
                  onClick={() => setStep("checkout")}
                  className="w-full"
                >
                  Procedo tek Dorëzimi →
                </Button>
              </>
            ) : (
              <form onSubmit={placeOrder} className="rounded-3xl bg-white border border-border/60 shadow-sm p-7 space-y-5">
                <h2 className="font-extrabold text-lg mb-2">Detajet e Dorëzimit</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      <User className="h-3.5 w-3.5 inline mr-1" />
                      Emri & Mbiemri *
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Emri i plotë"
                      className="w-full rounded-xl border-2 border-border/60 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 inline mr-1" />
                      Telefoni *
                    </label>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="+355 6X XXX XXXX"
                      className="w-full rounded-xl border-2 border-border/60 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 inline mr-1" />
                      Qyteti *
                    </label>
                    <input
                      required
                      value={form.city}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      placeholder="p.sh. Tiranë"
                      className="w-full rounded-xl border-2 border-border/60 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Adresa e Plotë *
                    </label>
                    <input
                      required
                      value={form.address}
                      onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                      placeholder="Rruga, numri, pallati..."
                      className="w-full rounded-xl border-2 border-border/60 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Shënime (opsionale)
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      placeholder="Udhëzime të veçanta për dorëzim..."
                      rows={3}
                      className="w-full rounded-xl border-2 border-border/60 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                    />
                  </div>
                </div>

                {/* COD notice */}
                <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-4">
                  <CreditCard className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-amber-900">Pagesa me Dorëzim (COD)</p>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Paguani vetëm kur të merrni produktin. Nuk kërkohet paradhënie ose kartë krediti.
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={placing}
                  className="w-full"
                >
                  <Truck className="h-5 w-5 mr-2" />
                  {placing ? "Duke konfirmuar..." : `Konfirmo Porosinë · ${formatPrice(total)}`}
                </Button>
              </form>
            )}
          </div>

          {/* Right — summary */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-border/60 shadow-sm p-6">
              <h3 className="font-extrabold mb-4">Përmbledhja</h3>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-2 text-sm">
                    <span className="text-muted-foreground truncate flex-1">
                      {item.nameSq} × {item.quantity}
                    </span>
                    <span className="font-semibold shrink-0">
                      {formatPrice((isB2b ? item.priceB2b : item.priceRetail) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Nëntotali</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dorëzimi</span>
                  <span className="text-emerald-600 font-semibold">Falas</span>
                </div>
                <div className="flex justify-between font-extrabold text-lg border-t pt-3">
                  <span>Totali</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {/* Delivery info */}
            {[
              { icon: Truck, label: "Dorëzim 24–48h", color: "text-blue-600 bg-blue-50" },
              { icon: CreditCard, label: "Cash me Dorëzim", color: "text-amber-600 bg-amber-50" },
              { icon: CheckCircle2, label: "Garanci Zyrtare", color: "text-emerald-600 bg-emerald-50" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3 rounded-xl bg-white border border-border/60 p-3 shadow-sm text-sm">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${f.color}`}>
                  <f.icon className="h-4 w-4" />
                </div>
                <span className="font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
