import { shopUrl } from "@/lib/shop-url";

/** Resolve admin path for in-app navigation (locale-prefixed app routes). */
export function localeAdminHref(locale: "sq" | "en", path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (locale === "en") return `/en${p}`;
  return p;
}

/**
 * Admin links from the shop app shell use the same origin as the main site; paths are locale-prefixed.
 */
export function crossAppAdminHref(
  _context: "locale" | "shop",
  locale: "sq" | "en",
  path: string
): string {
  return localeAdminHref(locale, path);
}

export function commerceHref(
  kind: "shopProducts" | "shopOrders" | "viewShop"
): string {
  if (kind === "shopProducts") return shopUrl("admin/products");
  if (kind === "shopOrders") return shopUrl("admin/orders");
  return shopUrl("");
}
