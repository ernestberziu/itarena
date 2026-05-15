"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";
import { shopCatalogHref } from "@/lib/shop-url";
import { Button } from "@/components/ui/button";
import { SHOP_CATEGORY_SELECTED_TEXT } from "@/lib/shop-category-selected-color";

interface Category {
  id: string;
  nameSq: string;
  nameEn: string;
  slug: string;
}

interface Product {
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
  category: { nameSq: string; nameEn: string };
}

interface ShopCatalogProps {
  products: Product[];
  categories: Category[];
  isB2b: boolean;
  activeCategory?: string;
  searchQuery?: string;
}

export function ShopCatalog({
  products,
  categories,
  isB2b,
  activeCategory,
  searchQuery,
}: ShopCatalogProps) {
  const router = useRouter();
  const [search, setSearch] = useState(searchQuery ?? "");
  const [isPending, startTransition] = useTransition();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeSlug = (() => {
    const raw = activeCategory?.trim();
    if (!raw) return undefined;
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  })();

  function applySearch(value: string) {
    const params: Record<string, string | undefined> = {};
    if (value) params.q = value;
    if (activeSlug) params.category = activeSlug;
    startTransition(() => {
      router.push(shopCatalogHref(params));
    });
  }

  function setCategory(slug: string | null) {
    const params: Record<string, string | undefined> = {};
    if (slug) params.category = slug;
    const qVal = search || searchQuery;
    if (qVal) params.q = qVal;
    startTransition(() => {
      router.push(shopCatalogHref(params));
    });
    setSidebarOpen(false);
  }

  return (
    <div className="bg-slate-50 min-h-screen">
    <div className="container mx-auto px-4 py-8">
      {/* Search + mobile filter toggle */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch(search)}
            placeholder="Kërko produkte, marka, SKU..."
            className="w-full rounded-xl border-2 border-border/60 bg-white pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(""); applySearch(""); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-1 text-muted-foreground transition-[background-color,color,transform] duration-200 ease-out hover:bg-slate-100 hover:text-foreground active:bg-slate-200 motion-safe:active:scale-95"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden flex items-center gap-2 rounded-xl border-2 border-border/60 bg-white px-4 py-3 text-sm font-medium cursor-pointer select-none transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out hover:bg-slate-50 hover:border-primary/50 hover:shadow-sm active:bg-slate-100 motion-safe:active:scale-[0.98]"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtro
        </button>
        <Button type="button" size="sm" onClick={() => applySearch(search)}>
          Kërko
        </Button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside
          className={cn(
            "shrink-0 w-56 space-y-2",
            "hidden lg:block",
            sidebarOpen && "!block fixed inset-0 z-50 w-full bg-white p-6 overflow-auto lg:static lg:bg-transparent lg:p-0"
          )}
        >
          {sidebarOpen && (
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <h3 className="font-bold">Kategoritë</h3>
              <button type="button" onClick={() => setSidebarOpen(false)} className="cursor-pointer rounded-lg p-2 text-muted-foreground transition-[background-color,color,transform] duration-200 ease-out hover:bg-slate-100 hover:text-foreground active:bg-slate-200 motion-safe:active:scale-95">
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          <div className="rounded-2xl bg-white border border-border/50 overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-border/40 bg-gradient-to-r from-primary/5 to-transparent">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Kategoritë</p>
            </div>
            <div className="p-2 space-y-0.5">
              <button
                type="button"
                onClick={() => setCategory(null)}
                className={cn(
                  "w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors motion-safe:active:scale-[0.99]",
                  activeSlug ? "text-foreground hover:bg-slate-50" : undefined
                )}
                style={!activeSlug ? { color: SHOP_CATEGORY_SELECTED_TEXT } : undefined}
              >
                Të gjitha
              </button>
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.slug)}
                  className={cn(
                    "w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors motion-safe:active:scale-[0.99]",
                    activeSlug === cat.slug ? undefined : "text-foreground hover:bg-slate-50"
                  )}
                  style={
                    activeSlug === cat.slug ? { color: SHOP_CATEGORY_SELECTED_TEXT } : undefined
                  }
                >
                  {cat.nameSq}
                </button>
              ))}
            </div>
          </div>

          {/* B2B badge */}
          {isB2b && (
            <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200/60 p-4">
              <p className="text-xs font-bold text-violet-700 mb-1">Çmimet B2B të aplikuara</p>
              <p className="text-xs text-violet-600/70 leading-relaxed">
                Shihni çmimet ekskluzive të rezervuara për bizneset e regjistruara.
              </p>
            </div>
          )}
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="font-bold text-lg mb-2">Nuk u gjet asnjë produkt</h3>
              <p className="text-muted-foreground text-sm">Provoni terma të tjerë kërkimi ose hiqni filtrat.</p>
            </div>
          ) : (
            <div
              className={cn(
                "grid gap-5 transition-opacity",
                isPending && "opacity-60",
                "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
              )}
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isB2b={isB2b}
                  lang="sq"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
