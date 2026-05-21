"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";
import { shopCatalogHref } from "@/lib/shop-url";
import { useShopLocale } from "@/hooks/use-shop-locale";
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
  /** Full count after category + search filters (hero + pagination total). */
  totalFiltered: number;
  page: number;
  pageSize: number;
  categories: Category[];
  isB2b: boolean;
  activeCategory?: string;
  searchQuery?: string;
}

export function ShopCatalog({
  products,
  totalFiltered,
  page,
  pageSize,
  categories,
  isB2b,
  activeCategory,
  searchQuery,
}: ShopCatalogProps) {
  const router = useRouter();
  const shopLocale = useShopLocale();
  const [search, setSearch] = useState(searchQuery ?? "");
  const [isPending, startTransition] = useTransition();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSearch(searchQuery ?? "");
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const rangeFrom = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeTo = Math.min(page * pageSize, totalFiltered);

  const activeSlug = (() => {
    const raw = activeCategory?.trim();
    if (!raw) return undefined;
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  })();

  function catalogPageHref(nextPage: number) {
    const p = Math.min(Math.max(1, nextPage), totalPages);
    return shopCatalogHref(
      {
        ...(searchQuery ? { q: searchQuery } : {}),
        ...(activeSlug ? { category: activeSlug } : {}),
        ...(p > 1 ? { page: String(p) } : {}),
      },
      shopLocale
    );
  }

  function applySearch(value: string) {
    const params: Record<string, string | undefined> = {};
    if (value) params.q = value;
    if (activeSlug) params.category = activeSlug;
    startTransition(() => {
      router.push(shopCatalogHref(params, shopLocale));
    });
  }

  function setCategory(slug: string | null) {
    const params: Record<string, string | undefined> = {};
    if (slug) params.category = slug;
    const qVal = search || searchQuery;
    if (qVal) params.q = qVal;
    startTransition(() => {
      router.push(shopCatalogHref(params, shopLocale));
    });
    setSidebarOpen(false);
  }

  return (
    <div className="bg-slate-50 min-h-screen">
    <div className="container mx-auto px-4 py-8">
      {/* Search + mobile filter toggle */}
      <div className="flex flex-wrap items-stretch gap-3 mb-6">
        <div className="relative min-w-0 flex-1 basis-full sm:basis-0">
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
          className="lg:hidden flex shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-border/60 bg-white px-4 py-3 text-sm font-medium cursor-pointer select-none transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out hover:bg-slate-50 hover:border-primary/50 hover:shadow-sm active:bg-slate-100 motion-safe:active:scale-[0.98]"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtro
        </button>
        <Button
          type="button"
          onClick={() => applySearch(search)}
          className="shrink-0 rounded-xl border-2 border-primary/80 px-4 py-3 h-auto text-sm font-medium lg:h-9 lg:py-2"
        >
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
          {totalFiltered === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="font-bold text-lg mb-2">Nuk u gjet asnjë produkt</h3>
              <p className="text-muted-foreground text-sm">Provoni terma të tjerë kërkimi ose hiqni filtrat.</p>
            </div>
          ) : (
            <>
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
                  />
                ))}
              </div>

              {totalPages > 1 ? (
                <nav
                  className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-8 sm:flex-row sm:items-center sm:justify-between"
                  aria-label="Faqosja e produkteve"
                >
                  <p className="text-sm text-slate-600">
                    Shfaqen{" "}
                    <span className="font-semibold text-slate-900">
                      {rangeFrom}–{rangeTo}
                    </span>{" "}
                    nga{" "}
                    <span className="font-semibold text-slate-900">{totalFiltered}</span> produkte
                    <span className="mt-1 block text-xs font-normal text-slate-500 sm:hidden">
                      Faqja {page} nga {totalPages}
                    </span>
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                    <span className="mr-1 hidden text-sm text-slate-500 sm:inline">
                      Faqja {page} / {totalPages}
                    </span>
                    {page > 1 ? (
                      <Button type="button" variant="outline" size="sm" className="h-9 gap-1 px-3" asChild>
                        <Link href={catalogPageHref(page - 1)} scroll>
                          <ChevronLeft className="h-4 w-4" aria-hidden />
                          Mëparës
                        </Link>
                      </Button>
                    ) : (
                      <Button type="button" variant="outline" size="sm" className="h-9 gap-1 px-3" disabled>
                        <ChevronLeft className="h-4 w-4 opacity-40" aria-hidden />
                        Mëparës
                      </Button>
                    )}
                    {page < totalPages ? (
                      <Button type="button" variant="outline" size="sm" className="h-9 gap-1 px-3" asChild>
                        <Link href={catalogPageHref(page + 1)} scroll>
                          Tjetra
                          <ChevronRight className="h-4 w-4" aria-hidden />
                        </Link>
                      </Button>
                    ) : (
                      <Button type="button" variant="outline" size="sm" className="h-9 gap-1 px-3" disabled>
                        Tjetra
                        <ChevronRight className="h-4 w-4 opacity-40" aria-hidden />
                      </Button>
                    )}
                  </div>
                </nav>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
