/**
 * Build absolute URLs for the IT Shop.
 * Production: https://shop.itarena.al/... (subdomain; middleware rewrites to /shop/*)
 * Local dev:  http://shop.localhost:3000/... (subdomain; same rewrite). Override with NEXT_PUBLIC_SHOP_URL.
 */
function stripTrailingSlash(s: string) {
  return s.replace(/\/$/, "");
}

/** Public base for shop links (no trailing slash). */
export function getShopBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SHOP_URL?.trim();
  if (explicit) return stripTrailingSlash(explicit);

  const app = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (app) {
    try {
      const u = new URL(app);
      const host = u.hostname;
      if (host === "localhost" || host === "127.0.0.1") {
        const protocol = u.protocol;
        let portPart = "";
        if (u.port) {
          portPart = `:${u.port}`;
        } else if (protocol === "http:") {
          portPart = ":3000";
        }
        return stripTrailingSlash(`${protocol}//shop.localhost${portPart}`);
      }
      const shopHost = host.startsWith("shop.") ? host : `shop.${host}`;
      return `${u.protocol}//${shopHost}`;
    } catch {
      /* fall through */
    }
  }
  return "https://shop.itarena.al";
}

/**
 * Absolute URL to a shop route.
 * @param path — segment after shop root, e.g. "", "cart", "products/abc", "admin/products"
 */
export function shopUrl(path = ""): string {
  const base = getShopBaseUrl();
  const p = path.replace(/^\/+/, "");
  if (!p) {
    return base.endsWith("/shop") ? base : `${base}/`;
  }
  return `${base}/${p}`;
}

/** Same as `shopUrl` but with `?lang=` for the shop UI toggle. */
export function shopUrlWithLang(path = "", lang: "sq" | "en"): string {
  const u = new URL(shopUrl(path));
  if (lang === "en") u.searchParams.set("lang", "en");
  else u.searchParams.delete("lang");
  return u.toString();
}

/** Main marketing site (not shop). Used for links from the shop subdomain. */
export function getMainAppBaseUrl(): string {
  const app = process.env.NEXT_PUBLIC_APP_URL?.trim();
  return stripTrailingSlash(app || "https://itarena.al");
}

export function mainSiteUrl(path = ""): string {
  const base = getMainAppBaseUrl();
  const p = path.replace(/^\/+/, "");
  if (!p) return `${base}/`;
  return `${base}/${p}`;
}

/**
 * Path for shop catalog query-string navigation from the client.
 * Uses `/shop` when the pathname is under `/shop` (path-mounted dev), otherwise `/` (shop subdomain).
 */
export function shopCatalogHref(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) search.set(k, v);
  }
  const q = search.toString();
  if (typeof window === "undefined") {
    const base = getShopBaseUrl().endsWith("/shop") ? "/shop" : "/";
    return q ? `${base}?${q}` : base;
  }
  const base = window.location.pathname.startsWith("/shop") ? "/shop" : "/";
  return q ? `${base}?${q}` : base;
}

/** Shop catalog URL filtered by category slug. */
export function shopCategoryUrl(slug: string): string {
  const u = new URL(shopUrl(""));
  u.searchParams.set("category", slug);
  return u.toString();
}
