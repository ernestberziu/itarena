import type { ShopProductOverlay } from "@prisma/client";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ShopCatalog } from "@/components/shop/shop-catalog";
import { getFinanca5Client } from "@/lib/financa5-client";
import { adaptProducts } from "@/lib/erp-adapters";
import { getShopProductOverlaysByKods, mergeShopProducts } from "@/lib/shop-product-overlay";
import { SHOP_CATALOG_PAGE_SIZE, shopCatalogHref } from "@/lib/shop-url";
import { getShopLocaleServer } from "@/lib/shop-locale-server";
import { Zap, Package, AlertTriangle } from "lucide-react";
import { ShopTrustStrip } from "@/components/shop/shop-trust-strip";

import { buildPageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const shopLocale = await getShopLocaleServer();
  return buildPageMetadata({
    locale: shopLocale,
    page: "shop",
    path: "/shop",
    title:
      shopLocale === "en"
        ? "All Products — IT Arena Shop"
        : "Të Gjitha Produktet — IT Arena Shop",
    shop: true,
  });
}

// Revalidate every 60 seconds so the CDN edge cache stays reasonably fresh
// without hammering the ERP API on every visitor request.
export const revalidate = 60;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string | string[];
    q?: string | string[];
    page?: string | string[];
  }>;
}) {
  const shopLocale = await getShopLocaleServer();
  const raw = await searchParams;
  const categorySlug = Array.isArray(raw.category) ? raw.category[0] : raw.category;
  const qParam = Array.isArray(raw.q) ? raw.q[0] : raw.q;
  const search = qParam?.trim() || undefined;
  const pageParam = Array.isArray(raw.page) ? raw.page[0] : raw.page;

  const session = await auth().catch(() => null);
  const isB2b =
    session?.user?.role === "COMPANY_ADMIN" ||
    session?.user?.companyId != null;

  // ── Fetch live from Financa5Api ────────────────────────────────────────────
  let products:   ReturnType<typeof adaptProducts>["products"]   = [];
  let categories: ReturnType<typeof adaptProducts>["categories"] = [];
  let fetchError: string | null = null;

  try {
    const client = getFinanca5Client();
    const [erpProducts, erpCategories] = await Promise.all([
      client.getAllProducts(),
      client.getAllCategories(),
    ]);

    ({ products, categories } = adaptProducts(erpProducts, erpCategories, {
      categorySlug,
      search,
    }));
    let overlayMap = new Map<string, ShopProductOverlay>();
    try {
      overlayMap = await getShopProductOverlaysByKods(products.map((p) => p.id));
    } catch (e) {
      console.error("[shop] overlay load failed:", e);
    }
    products = mergeShopProducts(products, overlayMap);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Financa5 API nuk është i arritshëm")) {
      console.warn("[shop]", msg);
    } else {
      console.error("[shop] failed to fetch from Financa5Api:", err);
    }
    fetchError = msg || "Gabim gjatë marrjes së produkteve.";
  }

  const totalFiltered = products.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / SHOP_CATALOG_PAGE_SIZE));

  let requestedPage = parseInt(String(pageParam ?? "1"), 10);
  if (!Number.isFinite(requestedPage) || requestedPage < 1) requestedPage = 1;
  const page = Math.min(requestedPage, totalPages);

  if (requestedPage !== page) {
    redirect(
      shopCatalogHref(
        {
          q: search,
          category: categorySlug,
          ...(page > 1 ? { page: String(page) } : {}),
        },
        shopLocale
      )
    );
  }

  const pageProducts = products.slice(
    (page - 1) * SHOP_CATALOG_PAGE_SIZE,
    page * SHOP_CATALOG_PAGE_SIZE
  );

  return (
    <div>
      {/* Hero banner */}
      <section className="relative overflow-hidden bg-[hsl(222,47%,9%)] text-white py-12 px-4">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-[200px] w-[200px] rounded-full bg-amber-500/15 blur-3xl" />
        </div>
        <div className="container relative mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20">
                <Zap className="h-4 w-4 text-amber-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                IT Arena Shop
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold leading-tight">
              {search
                ? `Rezultate për "${search}"`
                : categorySlug
                ? "Produkte sipas kategorisë"
                : "Hardware, Software & Periferikë"}
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              <span className="text-white font-bold">{totalFiltered}</span>{" "}
              {shopLocale === "en" ? "products" : "produkte"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            {isB2b && (
              <div className="flex items-center gap-2 rounded-2xl bg-violet-600/20 border border-violet-500/30 px-5 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-violet-400 animate-pulse" />
                <div>
                  <p className="text-xs font-bold text-violet-300">Çmimet B2B aktive</p>
                  <p className="text-xs text-violet-400">Çmimet preferenciale të aplikuara</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="container relative mx-auto px-4 border-t border-white/10 mt-8 md:mt-10">
          <ShopTrustStrip compact />
        </div>
      </section>

      {/* Error banner */}
      {fetchError && (
        <div className="container mx-auto px-4 mt-6">
          <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4 text-red-800">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Nuk mund të lidhemi me ERP</p>
              <p className="text-xs mt-0.5 text-red-600">{fetchError}</p>
            </div>
          </div>
        </div>
      )}

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Package className="h-6 w-6 animate-pulse" />
              <span>Duke ngarkuar produktet...</span>
            </div>
          </div>
        }
      >
        <ShopCatalog
          products={pageProducts}
          totalFiltered={totalFiltered}
          page={page}
          pageSize={SHOP_CATALOG_PAGE_SIZE}
          categories={categories}
          isB2b={isB2b}
          activeCategory={categorySlug}
          searchQuery={search}
        />
      </Suspense>
    </div>
  );
}
