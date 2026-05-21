/**
 * /shop/products/[id]
 *
 * [id] is the ERP article code (ARTIKUJ.KOD). Financa5 supplies prices/stock/names;
 * optional images and descriptions are merged from Postgres (`shop_product_overlays`).
 */

import type { Metadata } from "next";
import type { ShopProductOverlay } from "@prisma/client";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getFinanca5Client } from "@/lib/financa5-client";
import { adaptProduct, adaptCategory } from "@/lib/erp-adapters";
import { getShopProductOverlaysByKods, mergeShopProduct } from "@/lib/shop-product-overlay";
import { ProductDetailView } from "@/components/shop/product-detail-view";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { shopAbsoluteUrl } from "@/lib/seo/urls";
import { ProductJsonLd } from "@/lib/seo/json-ld";
import { getShopLocaleServer } from "@/lib/shop-locale-server";
import { shopPath } from "@/lib/shop-url";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const kod = decodeURIComponent(id);
  const shopLocale = await getShopLocaleServer();
  try {
    const product = await getFinanca5Client().getProductByKod(kod);
    return buildPageMetadata({
      locale: shopLocale,
      path: `/shop/products/${encodeURIComponent(kod)}`,
      title: `${product.name} — IT Arena Shop`,
      description: `${product.name} — ${product.categoryName}. SKU ${product.kod}.`,
      shop: true,
    });
  } catch {
    return {};
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kod     = decodeURIComponent(id);

  const session = await auth().catch(() => null);
  const isB2b =
    session?.user?.role === "COMPANY_ADMIN" ||
    session?.user?.companyId != null;

  // ── Fetch the product by ERP code ──────────────────────────────────────────
  let product: ReturnType<typeof adaptProduct> | null = null;
  let related: ReturnType<typeof adaptProduct>[] = [];

  try {
    const client = getFinanca5Client();
    const erpProduct = await client.getProductByKod(kod);

    const catMap = new Map([
      [erpProduct.categoryId, adaptCategory({
        id:       erpProduct.categoryId,
        name:     erpProduct.categoryName,
        parentId: null,
        level:    1,
        sortOrder: 0,
        isActive: true,
      })],
    ]);

    product = adaptProduct(erpProduct, catMap);

    // Load up to 8 related products from the same category
    const allProducts = await client.getAllProducts();
    related = allProducts
      .filter(
        (p) =>
          p.isActive &&
          p.kod !== kod &&
          p.categoryId === erpProduct.categoryId
      )
      .slice(0, 4)
      .map((p) => adaptProduct(p, catMap));

    const overlayKods = [product.erpKod, ...related.map((r) => r.erpKod)];
    let overlayMap = new Map<string, ShopProductOverlay>();
    try {
      overlayMap = await getShopProductOverlaysByKods(overlayKods);
    } catch (e) {
      console.error(`[product-detail] overlay load failed for '${kod}':`, e);
    }
    product = mergeShopProduct(product, overlayMap.get(product.erpKod) ?? null);
    related = related.map((r) => mergeShopProduct(r, overlayMap.get(r.erpKod) ?? null));
  } catch (err) {
    console.error(`[product-detail] failed to load product '${kod}':`, err);
  }

  if (!product) notFound();

  const shopLocale = await getShopLocaleServer();
  const productUrl = shopAbsoluteUrl(
    shopPath(shopLocale, `products/${encodeURIComponent(kod)}`)
  );

  return (
    <>
      <ProductJsonLd
        name={product.nameSq}
        description={product.descSq || product.nameSq}
        sku={product.sku}
        url={productUrl}
        image={product.images[0] ?? undefined}
        price={product.priceRetail}
        availability={
          product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock"
        }
      />
      <ProductDetailView
        product={product}
        related={related}
        isB2b={isB2b}
        isLoggedIn={!!session}
      />
    </>
  );
}
