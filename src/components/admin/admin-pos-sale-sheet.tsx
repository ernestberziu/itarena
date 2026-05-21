"use client";
import { useUiT } from "@/hooks/use-ui-t";

import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Search, Trash2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import type { PosProductRow } from "@/lib/pos/types";

type CartLine = PosProductRow & { quantity: number };

type ClientOption = {
  id: string;
  label: string;
  email: string | null;
  phone: string | null;
  companyName: string | null;
};

const MIN_CLIENT_SEARCH = 2;
const MIN_PRODUCT_SEARCH = 2;

export function AdminPosSaleSheet({
  open,
  onOpenChange,
  locale,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: string;
}) {
  const en = locale === "en";
  const tUi = useUiT();

  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<PosProductRow[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerMode, setCustomerMode] = useState<"cash" | "registered">("cash");
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null);
  const [clientQuery, setClientQuery] = useState("");
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!open) {
      setProducts([]);
      setLoadingProducts(false);
      return;
    }

    const q = query.trim();
    if (q.length < MIN_PRODUCT_SEARCH) {
      setProducts([]);
      setLoadingProducts(false);
      return;
    }

    let cancelled = false;
    setLoadingProducts(true);
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/pos/products?q=${encodeURIComponent(q)}`);
        const json = (await res.json()) as { items?: PosProductRow[]; error?: string };
        if (!res.ok) throw new Error(json.error ?? "Failed");
        if (!cancelled) setProducts(json.items ?? []);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [open, query]);

  useEffect(() => {
    if (!open || customerMode !== "registered") {
      setClients([]);
      setLoadingClients(false);
      return;
    }

    const q = clientQuery.trim();
    if (q.length < MIN_CLIENT_SEARCH) {
      setClients([]);
      setLoadingClients(false);
      return;
    }

    let cancelled = false;
    setLoadingClients(true);
    const id = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/admin/pos/clients?q=${encodeURIComponent(q)}`
        );
        const json = (await res.json()) as { items?: ClientOption[] };
        if (!cancelled) setClients(json.items ?? []);
      } catch {
        if (!cancelled) setClients([]);
      } finally {
        if (!cancelled) setLoadingClients(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [open, clientQuery, customerMode]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setCart([]);
      setCustomerMode("cash");
      setSelectedClient(null);
      setClientQuery("");
      setClients([]);
      setProducts([]);
    }
  }, [open]);

  function selectRegisteredMode() {
    setCustomerMode("registered");
    setSelectedClient(null);
    setClientQuery("");
    setClients([]);
  }

  function selectCashMode() {
    setCustomerMode("cash");
    setSelectedClient(null);
    setClientQuery("");
    setClients([]);
  }

  function pickClient(c: ClientOption) {
    setSelectedClient(c);
    setClientQuery("");
    setClients([]);
  }

  const cartTotal = useMemo(
    () => cart.reduce((s, l) => s + l.price * l.quantity, 0),
    [cart]
  );

  function addToCart(product: PosProductRow) {
    setCart((prev) => {
      const idx = prev.findIndex((l) => l.sku === product.sku);
      if (idx >= 0) {
        const line = prev[idx]!;
        if (line.quantity >= product.stock) {
          toast.error(tUi("max_stock_reached"));
          return prev;
        }
        return prev.map((l, i) =>
          i === idx ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }

  async function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const code = query.trim();
    if (!code) return;
    try {
      const res = await fetch(
        `/api/admin/pos/products/by-barcode?code=${encodeURIComponent(code)}`
      );
      const json = (await res.json()) as { product?: PosProductRow; error?: string };
      if (!res.ok || !json.product) {
        toast.error(json.error ?? tUi("not_found"));
        return;
      }
      addToCart(json.product);
      setQuery("");
    } catch {
      toast.error(tUi("lookup_failed"));
    }
  }

  function changeQty(sku: string, delta: number) {
    setCart((prev) =>
      prev
        .map((l) => {
          if (l.sku !== sku) return l;
          const next = l.quantity + delta;
          if (next <= 0) return null;
          if (next > l.stock) {
            toast.error(tUi("max_stock_reached"));
            return l;
          }
          return { ...l, quantity: next };
        })
        .filter((l): l is CartLine => l != null)
    );
  }

  async function completeSale() {
    if (cart.length === 0) {
      toast.error(tUi("add_products"));
      return;
    }
    if (customerMode === "registered" && !selectedClient) {
      toast.error(tUi("select_a_customer"));
      return;
    }

    setCompleting(true);
    try {
      const body = {
        items: cart.map((l) => ({
          sku: l.sku,
          name: l.name,
          quantity: l.quantity,
          price: l.price,
        })),
        customerType: customerMode === "cash" ? "cash" : "registered",
        userId: customerMode === "registered" ? selectedClient?.id : undefined,
        paymentMethod: "CASH" as const,
      };
      const res = await fetch("/api/admin/pos/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !json.id) throw new Error(json.error ?? "Failed");

      const lang = en ? "en" : "sq";
      window.open(
        `/api/admin/pos/sales/${json.id}/receipt?lang=${lang}&autoprint=1`,
        "_blank",
        "noopener,noreferrer"
      );
      toast.success(tUi("sale_completed"));
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : tUi("error"));
    } finally {
      setCompleting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex h-[92vh] max-h-[92vh] flex-col gap-0 rounded-t-2xl p-0 sm:max-w-full"
      >
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="h-5 w-5 text-primary" strokeWidth={2} aria-hidden />
            {tUi("pos_sale")}
          </SheetTitle>
        </SheetHeader>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 md:grid-cols-2">
          <div className="flex min-h-0 flex-col border-b md:border-b-0 md:border-r">
            <div className="space-y-2 border-b p-4">
              <Label htmlFor="pos-search">{tUi("search_sku_barcode_name")}</Label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  strokeWidth={2}
                  aria-hidden
                />
                <Input
                  id="pos-search"
                  className="pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder={tUi("sku_barcode_or_name_min_2_chars")}
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {tUi("press_enter_to_scan_full_barcode_sku")}
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {query.trim().length < MIN_PRODUCT_SEARCH ? (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                  {tUi("type_at_least_2_characters_to_search_the_catalog")}
                </p>
              ) : loadingProducts ? (
                <p className="py-8 text-center text-sm text-muted-foreground">…</p>
              ) : products.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {tUi("no_products_found")}
                </p>
              ) : (
                <ul className="divide-y divide-border/60">
                  {products.map((p) => (
                    <li key={p.sku}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/50"
                        onClick={() => addToCart(p)}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{p.name}</p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {p.sku}
                            {p.barcode ? ` · ${p.barcode}` : ""}
                          </p>
                        </div>
                        <div className="shrink-0 text-right text-xs">
                          <p className="font-semibold">{formatPrice(p.price)}</p>
                          <p className="text-muted-foreground">
                            {tUi("stock")}: {p.stock}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex min-h-0 flex-col">
            <div className="space-y-3 border-b p-4">
              <Label>{tUi("customer")}</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={customerMode === "cash" ? "default" : "outline"}
                  onClick={selectCashMode}
                >
                  {tUi("cash_client")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={customerMode === "registered" ? "default" : "outline"}
                  onClick={selectRegisteredMode}
                >
                  {tUi("registered_client")}
                </Button>
              </div>
              {customerMode === "registered" ? (
                <div className="space-y-2">
                  {selectedClient ? (
                    <div className="flex items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/[0.06] px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{selectedClient.label}</p>
                        {selectedClient.companyName ? (
                          <p className="truncate text-xs text-muted-foreground">
                            {selectedClient.companyName}
                          </p>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="shrink-0 text-xs"
                        onClick={() => setSelectedClient(null)}
                      >
                        {tUi("change")}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Input
                        value={clientQuery}
                        onChange={(e) => setClientQuery(e.target.value)}
                        placeholder={tUi("name_email_or_phone_min_2_chars")}
                        autoComplete="off"
                      />
                      {clientQuery.trim().length < MIN_CLIENT_SEARCH ? (
                        <p className="text-xs text-muted-foreground">
                          {tUi("type_at_least_2_characters_to_search")}
                        </p>
                      ) : loadingClients ? (
                        <p className="text-xs text-muted-foreground">…</p>
                      ) : clients.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          {tUi("no_clients_found")}
                        </p>
                      ) : (
                        <ul className="max-h-36 overflow-y-auto rounded-lg border divide-y">
                          {clients.map((c) => (
                            <li key={c.id}>
                              <button
                                type="button"
                                className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50"
                                onClick={() => pickClient(c)}
                              >
                                <span className="font-medium">{c.label}</span>
                                {c.email ? (
                                  <span className="block truncate text-xs text-muted-foreground">
                                    {c.email}
                                  </span>
                                ) : null}
                                {c.companyName ? (
                                  <span className="text-xs text-muted-foreground">
                                    {c.companyName}
                                  </span>
                                ) : null}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              ) : null}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {cart.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {tUi("cart_is_empty")}
                </p>
              ) : (
                <ul className="divide-y divide-border/60">
                  {cart.map((l) => (
                    <li key={l.sku} className="flex items-center gap-2 px-2 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{l.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(l.price)} × {l.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => changeQty(l.sku, -1)}
                        >
                          <Minus className="h-3.5 w-3.5" strokeWidth={2} />
                        </Button>
                        <span className="w-6 text-center text-sm tabular-nums">{l.quantity}</span>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => changeQty(l.sku, 1)}
                        >
                          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 text-destructive"
                          onClick={() =>
                            setCart((prev) => prev.filter((x) => x.sku !== l.sku))
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t p-4 space-y-3">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>{tUi("total")}</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <Button
                type="button"
                className="w-full"
                disabled={completing || cart.length === 0}
                onClick={() => void completeSale()}
              >
                {completing
                  ? "…"
                  : tUi("complete_sale_print")}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
