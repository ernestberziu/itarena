/**
 * erp-adapters.ts
 *
 * Converts Financa5Api response types into the shapes that the existing
 * shop components (ProductCard, ShopCatalog, ProductDetailView) expect.
 *
 * This file is the only place that knows about both shapes — everything
 * else in the shop just uses the adapted types.
 */

import type { Financa5Product, Financa5Category } from "./financa5-client";

// ─── Adapted shapes (match existing component interfaces) ─────────────────────

export interface ShopCategory {
  id: string;
  nameSq: string;
  nameEn: string;
  /** We use the ERP category id (LISTE.KOD) as the slug for URL filtering. */
  slug: string;
}

export interface ShopProduct {
  id: string;           // = kod — used in /shop/products/[id] URL
  nameSq: string;       // = name
  nameEn: string;       // = name
  sku: string;          // = kod
  descSq: string;       // = name  (ERP has no separate description)
  descEn: string;       // = name
  priceRetail: number;  // = priceWithVat (incl. VAT — retail display)
  priceB2b: number;     // = price       (excl. VAT — B2B/wholesale)
  stock: number;        // = Math.round(stock)
  lowStockAt: number;   // = 5
  images: string[];     // ERP has no images — empty array
  specs: Record<string, string>; // unit, vatRate, costPrice
  isFeatured: boolean;  // = false
  isActive: boolean;
  brand: string | null; // = supplierCode
  barcode: string | null;
  erpKod: string;       // = kod (for admin display)
  category: ShopCategory;
}

// ─── Adapters ─────────────────────────────────────────────────────────────────

export function adaptCategory(cat: Financa5Category): ShopCategory {
  return {
    id:     cat.id,
    nameSq: cat.name,
    nameEn: cat.name,
    slug:   cat.id,   // ERP id doubles as URL slug
  };
}

export function adaptProduct(
  p: Financa5Product,
  categoryMap: Map<string, ShopCategory>
): ShopProduct {
  const category: ShopCategory = categoryMap.get(p.categoryId) ?? {
    id:     p.categoryId,
    nameSq: p.categoryName,
    nameEn: p.categoryName,
    slug:   p.categoryId,
  };

  const specs: Record<string, string> = {};
  if (p.unit)    specs["Njësi"]  = p.unit;
  if (p.vatRate) specs["TVSH"]   = `${p.vatRate}%`;
  if (p.costPrice > 0) specs["Çmimi kosto"] = `${p.costPrice.toFixed(2)} ALL`;

  return {
    id:          p.kod,
    nameSq:      p.name,
    nameEn:      p.name,
    sku:         p.kod,
    descSq:      p.name,
    descEn:      p.name,
    priceRetail: p.priceWithVat,
    priceB2b:    p.price,
    stock:       Math.max(0, Math.round(p.stock)),
    lowStockAt:  5,
    images:      [],
    specs,
    isFeatured:  false,
    isActive:    p.isActive,
    brand:       p.supplierCode || null,
    barcode:     p.barcode,
    erpKod:      p.kod,
    category,
  };
}

/**
 * Converts a full list of ERP products + categories into shop-ready shapes,
 * with optional client-side filtering by category slug and search query.
 */
export function adaptProducts(
  products: Financa5Product[],
  categories: Financa5Category[],
  opts?: { categorySlug?: string; search?: string }
): { products: ShopProduct[]; categories: ShopCategory[] } {
  const adaptedCategories = categories
    .filter((c) => c.isActive)
    .map(adaptCategory);

  const catMap = new Map(adaptedCategories.map((c) => [c.id, c]));

  let adapted = products
    .filter((p) => p.isActive)
    .map((p) => adaptProduct(p, catMap));

  if (opts?.categorySlug) {
    adapted = adapted.filter((p) => p.category.slug === opts.categorySlug);
  }

  if (opts?.search) {
    const q = opts.search.toLowerCase();
    adapted = adapted.filter(
      (p) =>
        p.nameSq.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.brand ?? "").toLowerCase().includes(q) ||
        (p.barcode ?? "").toLowerCase().includes(q)
    );
  }

  return { products: adapted, categories: adaptedCategories };
}
