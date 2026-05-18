import type { ShopProductOverlay } from "@prisma/client";
import type { AdminCatalogRow } from "@/components/admin/admin-catalog-types";
import { getFinanca5Client } from "@/lib/financa5-client";
import { adaptProducts } from "@/lib/erp-adapters";
import { getShopProductOverlaysByKods, mergeShopProducts } from "@/lib/shop-product-overlay";

export async function loadAdminCatalogRows(input: {
  q?: string | null;
  categorySlug?: string | null;
}): Promise<{ rows: AdminCatalogRow[]; categories: ReturnType<typeof adaptProducts>["categories"] }> {
  const client = getFinanca5Client();
  const [erpProducts, erpCategories] = await Promise.all([
    client.getAllProducts(),
    client.getAllCategories(),
  ]);
  const adapted = adaptProducts(erpProducts, erpCategories, {
    categorySlug: input.categorySlug?.trim() || undefined,
    search: input.q?.trim() || undefined,
  });
  let overlayMap = new Map<string, ShopProductOverlay>();
  try {
    overlayMap = await getShopProductOverlaysByKods(adapted.products.map((p) => p.id));
  } catch (e) {
    console.error("[admin/catalog] overlay load failed:", e);
  }
  const merged = mergeShopProducts(adapted.products, overlayMap);
  const rows = merged.map((product) => {
    const ov = overlayMap.get(product.erpKod);
    return {
      id: product.id,
      sku: product.sku,
      nameSq: product.nameSq,
      nameEn: product.nameEn,
      brand: product.brand,
      stock: product.stock,
      lowStockAt: product.lowStockAt,
      isActive: product.isActive,
      imagesJson: JSON.stringify(product.images),
      priceRetail: String(product.priceRetail),
      priceB2b: String(product.priceB2b),
      category: { nameSq: product.category.nameSq, nameEn: product.category.nameEn },
      overlayDescriptionSq: ov?.descriptionSq ?? null,
      overlayDescriptionEn: ov?.descriptionEn ?? null,
    };
  });
  return { rows, categories: adapted.categories };
}
