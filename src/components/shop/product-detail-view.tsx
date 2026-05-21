"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart, Building2, ChevronLeft, Package, Tag,
  Star, Shield, Truck, CreditCard, Minus, Plus, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "./cart-context";
import { ProductCard } from "./product-card";
import { formatPrice } from "@/lib/utils";
import { shopCatalogHref } from "@/lib/shop-url";
import { useShopLocale, useShopPath } from "@/hooks/use-shop-locale";
import { useTranslations } from "next-intl";

interface Product {
  id: string;
  nameSq: string;
  nameEn: string;
  sku: string;
  descSq: string;
  descEn: string;
  priceRetail: number;
  priceB2b: number;
  stock: number;
  lowStockAt: number;
  images: string[];
  isFeatured: boolean;
  brand?: string | null;
  barcode?: string | null;
  erpKod?: string | null;
  unit?: string | null;
  category: { id: string; nameSq: string; nameEn: string; slug: string };
}

interface ProductDetailViewProps {
  product: Product;
  related: Omit<Product, "descSq" | "descEn">[];
  isB2b: boolean;
  isLoggedIn: boolean;
}

export function ProductDetailView({ product, related, isB2b, isLoggedIn }: ProductDetailViewProps) {
  const { addItem } = useCart();
  const shopLocale = useShopLocale();
  const shopHome = useShopPath();
  const t = useTranslations("shop");
  const productName = shopLocale === "en" ? product.nameEn : product.nameSq;
  const shopCart = useShopPath("cart");
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [quoteQty, setQuoteQty] = useState(10);
  const [quoteForm, setQuoteForm] = useState({ name: "", company: "", email: "", phone: "", notes: "" });
  const [quoteSending, setQuoteSending] = useState(false);
  const [quoteSent, setQuoteSent] = useState(false);

  const price = isB2b ? product.priceB2b : product.priceRetail;
  const inStock = product.stock > 0;
  const images = product.images.length > 0 ? product.images : [];

  function handleAddToCart() {
    if (!inStock) return;
    addItem({
      id: product.id,
      nameSq: product.nameSq,
      nameEn: product.nameEn,
      sku: product.sku,
      priceRetail: product.priceRetail,
      priceB2b: product.priceB2b,
      stock: product.stock,
      images: product.images,
    }, qty);
    toast.success(t("addedToCartNamedQty", { name: productName, qty }));
  }

  async function handleQuoteSubmit(e: React.FormEvent) {
    e.preventDefault();
    setQuoteSending(true);
    try {
      const res = await fetch("/api/shop/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: product.sku,
          productName: product.nameSq,
          quantity: quoteQty,
          ...quoteForm,
        }),
      });
      if (res.ok) {
        setQuoteSent(true);
        toast.success("Kërkesa e ofertës u dërgua! Do t'ju kontaktojmë së shpejti.");
      } else {
        toast.error("Ndodhi një gabim. Provoni përsëri.");
      }
    } catch {
      toast.error("Ndodhi një gabim. Provoni përsëri.");
    } finally {
      setQuoteSending(false);
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href={shopHome} className="flex items-center gap-1 hover:text-primary transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Kthehu tek produktet
          </Link>
          <span>/</span>
          <Link
            href={shopCatalogHref({ category: product.category.slug }, shopLocale)}
            className="hover:text-primary transition-colors"
          >
            {product.category.nameSq}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.nameSq}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Image gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl bg-white border border-border/60 overflow-hidden shadow-sm relative">
              {images.length > 0 ? (
                <Image
                  src={images[selectedImage]}
                  alt={product.nameSq}
                  fill
                  className="object-contain p-8"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Package className="h-24 w-24 text-slate-200" />
                </div>
              )}
              {product.isFeatured && (
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-md">
                    <Star className="h-3 w-3 fill-white" />
                    I Rekomandueshëm
                  </span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative h-20 w-20 shrink-0 rounded-xl border-2 bg-white overflow-hidden transition-all ${
                      selectedImage === i ? "border-primary shadow-md" : "border-border/40 hover:border-border"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-contain p-2" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="space-y-6">
            {/* Category & Brand */}
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={shopCatalogHref({ category: product.category.slug }, shopLocale)}
                className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
              >
                {product.category.nameSq}
              </Link>
              {product.brand && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Tag className="h-3 w-3" />
                  {product.brand}
                </span>
              )}
              <span className="text-xs text-muted-foreground font-mono">SKU: {product.sku}</span>
              {product.barcode && (
                <span className="text-xs text-muted-foreground font-mono">
                  Barcode: {product.barcode}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">{product.nameSq}</h1>

            {/* Pricing */}
            <div className="rounded-2xl bg-white border border-border/60 p-5 shadow-sm">
              {isB2b ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-extrabold text-violet-700">{formatPrice(price)}</span>
                    <span className="rounded-full bg-violet-100 border border-violet-200 px-3 py-1 text-xs font-bold text-violet-700">
                      Çmimi B2B
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-through">
                    Çmimi retail: {formatPrice(product.priceRetail)}
                  </p>
                </div>
              ) : (
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-extrabold">{formatPrice(price)}</span>
                  {product.priceB2b < product.priceRetail && (
                    <span className="text-sm text-muted-foreground mb-1">
                      Çmimi B2B i disponueshëm
                    </span>
                  )}
                </div>
              )}
              <div className="mt-3 flex items-center gap-2 text-sm">
                {inStock ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="font-semibold text-emerald-700">Në stok</span>
                  </>
                ) : (
                  <span className="text-red-600 font-semibold">Jashtë stoku</span>
                )}
              </div>
            </div>

            {/* Qty + Add to cart */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-xl border-2 border-border/60 bg-white overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    type="button"
                    disabled={qty <= 1}
                    className="cursor-pointer select-none px-4 py-3 transition-[background-color,color,transform] duration-200 ease-out hover:bg-slate-100 active:bg-slate-200 motion-safe:active:scale-[0.96] disabled:pointer-events-none disabled:opacity-35 disabled:active:scale-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="cursor-pointer select-none px-4 py-3 transition-[background-color,color,transform] duration-200 ease-out hover:bg-slate-100 active:bg-slate-200 motion-safe:active:scale-[0.96] disabled:pointer-events-none disabled:opacity-35 disabled:active:scale-100"
                    disabled={qty >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <Button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="flex-1"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Shto në Shportë
                </Button>
              </div>
              <Button variant="outline" asChild className="w-full h-auto min-h-12 py-4">
                <Link href={shopCart}>
                  Shko tek Shporta →
                </Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: "Dorëzim 24–48h", color: "text-blue-600" },
                { icon: CreditCard, label: "Pagë me Dorëzim", color: "text-emerald-600" },
                { icon: Shield, label: "Garanci Zyrtare", color: "text-violet-600" },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-1 rounded-xl bg-white border border-border/60 p-3 text-center shadow-sm">
                  <b.icon className={`h-5 w-5 ${b.color}`} />
                  <span className="text-[10px] font-semibold text-muted-foreground leading-tight">{b.label}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            {product.descSq && (
              <div>
                <h3 className="font-bold mb-2">Përshkrim</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.descSq}</p>
              </div>
            )}
          </div>
        </div>

        {/* B2B Quote section */}
        <div id="b2b-quote" className="mb-16">
          <div className="rounded-3xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200/60 p-8 md:p-10">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-violet-900">
                  Kërkoni Ofertë B2B për Sasi
                </h2>
                <p className="text-violet-700 text-sm mt-1">
                  Blini sasi të mëdha dhe merrni çmime ekskluzive. Plotësoni formularin dhe ekipi ynë do t&apos;ju kontaktojë.
                </p>
              </div>
            </div>

            {quoteSent ? (
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-5">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-800">Kërkesa u dërgua me sukses!</p>
                  <p className="text-sm text-emerald-700">Do t'ju kontaktojmë brenda 24 orëve.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-violet-800 uppercase tracking-wide">Sasia *</label>
                  <div className="flex items-center rounded-xl border-2 border-violet-200 bg-white overflow-hidden focus-within:border-violet-500">
                    <button type="button" onClick={() => setQuoteQty(Math.max(1, quoteQty - 1))} className="cursor-pointer select-none px-4 py-3 transition-[background-color,color,transform] duration-200 ease-out hover:bg-violet-50 active:bg-violet-100 motion-safe:active:scale-[0.96] disabled:pointer-events-none disabled:opacity-35 disabled:active:scale-100" disabled={quoteQty <= 1}>
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={quoteQty}
                      min={1}
                      onChange={(e) => setQuoteQty(Number(e.target.value))}
                      className="w-full text-center font-bold focus:outline-none py-3"
                    />
                    <button type="button" onClick={() => setQuoteQty(quoteQty + 1)} className="cursor-pointer select-none px-4 py-3 transition-[background-color,color,transform] duration-200 ease-out hover:bg-violet-50 active:bg-violet-100 motion-safe:active:scale-[0.96]">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-violet-800 uppercase tracking-wide">Emri & Mbiemri *</label>
                  <input
                    required
                    value={quoteForm.name}
                    onChange={(e) => setQuoteForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Emri juaj"
                    className="w-full rounded-xl border-2 border-violet-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-violet-800 uppercase tracking-wide">Kompania *</label>
                  <input
                    required
                    value={quoteForm.company}
                    onChange={(e) => setQuoteForm((f) => ({ ...f, company: e.target.value }))}
                    placeholder="Emri i kompanisë"
                    className="w-full rounded-xl border-2 border-violet-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-violet-800 uppercase tracking-wide">Email *</label>
                  <input
                    required
                    type="email"
                    value={quoteForm.email}
                    onChange={(e) => setQuoteForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="email@kompania.al"
                    className="w-full rounded-xl border-2 border-violet-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-violet-800 uppercase tracking-wide">Telefoni *</label>
                  <input
                    required
                    type="tel"
                    value={quoteForm.phone}
                    onChange={(e) => setQuoteForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+355 6X XXX XXXX"
                    className="w-full rounded-xl border-2 border-violet-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-violet-800 uppercase tracking-wide">Shënime shtesë</label>
                  <textarea
                    value={quoteForm.notes}
                    onChange={(e) => setQuoteForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Kushte të veçanta, terma pagese, specifikime shtesë..."
                    rows={3}
                    className="w-full rounded-xl border-2 border-violet-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-violet-500 resize-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <Button
                    type="submit"
                    disabled={quoteSending}
                    className="w-full h-auto min-h-12 py-4"
                  >
                    <Building2 className="h-5 w-5 mr-2" />
                    {quoteSending ? "Duke dërguar..." : "Kërko Ofertën B2B"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-extrabold mb-6">Produkte të Ngjashme</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    ...p,
                    descSq: "",
                    descEn: "",
                    lowStockAt: 5,
                  } as never}
                  isB2b={isB2b}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
