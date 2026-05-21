"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Building2, Tag, Package } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "./cart-context";
import { formatPrice } from "@/lib/utils";
import { useShopLocale, useShopPath } from "@/hooks/use-shop-locale";
import { useTranslations } from "next-intl";

interface ProductCardProps {
  product: {
    id: string;
    nameSq: string;
    nameEn: string;
    sku: string;
    priceRetail: number;
    priceB2b: number;
    stock: number;
    images: string[];
    isFeatured: boolean;
    isActive: boolean;
    brand?: string | null;
    barcode?: string | null;
    erpKod?: string | null;
    category: { nameSq: string; nameEn: string };
  };
  isB2b: boolean;
}
// Note: barcode and erpKod are optional fields coming from the ERP.
// They are accepted here for forward-compatibility but not displayed on the card.
// The detail page (product-detail-view.tsx) shows the barcode below the SKU.

export function ProductCard({ product, isB2b }: ProductCardProps) {
  const { addItem } = useCart();
  const locale = useShopLocale();
  const t = useTranslations("shop");
  const productHref = useShopPath(`products/${product.id}`);

  const name = locale === "en" ? product.nameEn : product.nameSq;
  const price = isB2b ? product.priceB2b : product.priceRetail;
  const image = product.images[0] ?? null;
  const inStock = product.stock > 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
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
    });
    toast.success(t("addedToCartNamed", { name }));
  }

  return (
    <Link href={productHref} className="group block">
      <div className="relative rounded-2xl bg-white border border-border/50 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1.5">
        {/* Image */}
        <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <Package className="h-14 w-14 text-slate-300" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">IT Arena</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground shadow-md">
                ⭐ {t("featured")}
              </span>
            )}
            {!inStock && (
              <span className="rounded-full bg-red-500/90 px-2.5 py-1 text-[10px] font-bold text-white">
                {t("out_of_stock")}
              </span>
            )}
            {isB2b && (
              <span className="rounded-full bg-violet-600 px-2.5 py-1 text-[10px] font-bold text-white">
                B2B
              </span>
            )}
          </div>

          {/* Stock indicator */}
          {inStock && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-semibold text-emerald-700">{t("in_stock")}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 border-t border-border/40">
          {/* Category + brand */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="rounded-full bg-primary/8 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wide">
              {locale === "en" ? product.category.nameEn : product.category.nameSq}
            </span>
            {product.brand && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                <Tag className="h-2.5 w-2.5" />
                {product.brand}
              </span>
            )}
          </div>


          <h3 className="font-bold text-sm leading-snug mb-3 line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
            {name}
          </h3>

          {/* Pricing */}
          <div className="mb-4 rounded-xl bg-slate-50 px-3 py-2.5 border border-border/40">
            {isB2b ? (
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground line-through">{formatPrice(product.priceRetail)}</span>
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold text-violet-700">B2B</span>
                </div>
                <span className="text-xl font-extrabold text-violet-700">{formatPrice(price)}</span>
              </div>
            ) : (
              <div>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{t(isB2b ? "b2b_price" : "retail_price")}</span>
                <div className="text-xl font-extrabold text-primary">{formatPrice(price)}</div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 text-xs"
              disabled={!inStock}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
              {t("add_to_cart")}
            </Button>
            {(isB2b || !isB2b) && (
              <Button
                size="sm"
                variant="secondary"
                className="shrink-0 border-violet-900 bg-violet-700 text-white text-xs hover:bg-violet-600 hover:border-violet-700 hover:shadow-md active:bg-violet-800 active:border-violet-950 active:shadow-sm"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `${productHref}#b2b-quote`;
                }}
              >
                <Building2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
