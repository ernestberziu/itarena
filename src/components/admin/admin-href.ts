import { shopUrl, mainSiteUrl } from "@/lib/shop-url";

/** Resolve admin path for in-app navigation (locale-prefixed app routes). */
export function localeAdminHref(locale: "sq" | "en", path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (locale === "en") return `/en${p}`;
  return p;
}

/**
 * When rendered on the shop host, main-app admin links must be absolute to the marketing app.
 */
export function crossAppAdminHref(
  context: "locale" | "shop",
  locale: "sq" | "en",
  path: string
): string {
  const rel = localeAdminHref(locale, path);
  if (context === "locale") return rel;
  return mainSiteUrl(rel);
}

export function commerceHref(
  kind: "shopProducts" | "shopOrders" | "viewShop"
): string {
  if (kind === "shopProducts") return shopUrl("admin/products");
  if (kind === "shopOrders") return shopUrl("admin/orders");
  return shopUrl("");
}
