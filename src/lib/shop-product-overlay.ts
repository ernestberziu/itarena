import type { ShopProductOverlay } from "@prisma/client";
import type { ShopProduct } from "@/lib/erp-adapters";
import { db } from "@/lib/db";

export const SHOP_OVERLAY_MAX_IMAGES = 10;
export const SHOP_OVERLAY_MAX_DESCRIPTION_CHARS = 24_000;

export function parseImagesJson(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  } catch {
    return [];
  }
}

/** Only HTTPS delivery URLs on Cloudinary (prevents arbitrary URL injection). */
export function isAllowedOverlayImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    return u.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

export function mergeShopProduct(base: ShopProduct, overlay: ShopProductOverlay | null): ShopProduct {
  if (!overlay) return base;
  const overlayImages = parseImagesJson(overlay.imagesJson);
  const images = overlayImages.length > 0 ? overlayImages : base.images;
  const sq = overlay.descriptionSq?.trim();
  const en = overlay.descriptionEn?.trim();
  return {
    ...base,
    images,
    descSq: sq && sq.length > 0 ? sq : base.descSq,
    descEn: en && en.length > 0 ? en : base.descEn,
  };
}

export async function getShopProductOverlaysByKods(
  erpKods: string[]
): Promise<Map<string, ShopProductOverlay>> {
  const unique = [...new Set(erpKods.filter(Boolean))];
  if (unique.length === 0) return new Map();
  const rows = await db.shopProductOverlay.findMany({
    where: { erpKod: { in: unique } },
  });
  return new Map(rows.map((r) => [r.erpKod, r]));
}

export function mergeShopProducts(
  products: ShopProduct[],
  overlayMap: Map<string, ShopProductOverlay>
): ShopProduct[] {
  return products.map((p) => mergeShopProduct(p, overlayMap.get(p.erpKod) ?? null));
}
