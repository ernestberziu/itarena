/**
 * Shop URLs live on the same origin under `/shop` (single-domain architecture).
 *
 * Resolution order for absolute shop base:
 * 1. `NEXT_PUBLIC_SHOP_URL` — optional override if the shop is hosted on a different origin (rare).
 * 2. `PUBLIC_URL` or `NEXT_PUBLIC_APP_URL` + `/shop` — default production shape (`https://domain.com/shop`).
 * 3. Optional request context (server) when public URL env is unset.
 * 4. Browser `origin/shop` on the client.
 * 5. `VERCEL_URL` preview: `https://{host}/shop` (no separate shop subdomain).
 * 6. Dev fallback: `http://localhost:3000/shop`.
 */

function stripTrailingSlash(s: string) {
  return s.replace(/\/$/, "");
}

/** Canonical public site origin (no trailing slash). */
export function getPublicAppBaseUrl(): string {
  const base =
    process.env.PUBLIC_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim();
  return stripTrailingSlash(base || "https://itarena.al");
}

/** Default hero / CMS shop CTA path (same-origin `/shop`). */
export const DEFAULT_SHOP_PATH = "/shop";

/**
 * Maps legacy `https://shop.example.com/...` to `/shop...`.
 * Leaves other absolute URLs unchanged.
 */
export function normalizeShopMarketingLink(link: string): string {
  const trimmed = link.trim();
  if (!trimmed) return DEFAULT_SHOP_PATH;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const u = new URL(trimmed);
      if (u.hostname.toLowerCase().startsWith("shop.")) {
        const rest =
          u.pathname === "/" || u.pathname === ""
            ? ""
            : u.pathname.replace(/^\/shop\/?/i, "").replace(/^\/+/, "");
        const path = rest ? `${DEFAULT_SHOP_PATH}/${rest}` : DEFAULT_SHOP_PATH;
        return u.search ? `${path}${u.search}` : path;
      }
    } catch {
      /* keep original */
    }
    return trimmed;
  }

  if (trimmed.startsWith("/shop")) return trimmed;
  return trimmed;
}

/** Detect shop UI locale from browser pathname (`/en/shop` → en). */
export function getShopLocaleFromPathname(pathname: string): "sq" | "en" {
  return pathname === "/en/shop" || pathname.startsWith("/en/shop/") ? "en" : "sq";
}

/** Segment after `/shop` or `/en/shop`, e.g. `cart` or `products/ABC`. */
export function getShopSubpath(pathname: string): string {
  if (pathname.startsWith("/en/shop/")) return pathname.slice("/en/shop/".length);
  if (pathname === "/en/shop") return "";
  if (pathname.startsWith("/shop/")) return pathname.slice("/shop/".length);
  if (pathname === "/shop") return "";
  return "";
}

/**
 * Locale-aware shop path (same convention as marketing site: sq has no prefix, en uses `/en`).
 */
export function shopPath(locale: "sq" | "en", path = ""): string {
  const segment = path.replace(/^\/+/, "");
  if (locale === "en") {
    return segment ? `/en/shop/${segment}` : "/en/shop";
  }
  return segment ? `/shop/${segment}` : "/shop";
}

/** Switch language while preserving shop subpath (cart, product, query handled separately). */
export function shopSwitchLocaleHref(pathname: string, target: "sq" | "en"): string {
  const sub = getShopSubpath(pathname);
  const search =
    typeof window !== "undefined" ? window.location.search : "";
  return `${shopPath(target, sub)}${search}`;
}

/**
 * Resolves CMS/marketing hrefs: shop uses `/shop` or `/en/shop`;
 * other internal paths get the locale prefix (`/en/...`).
 */
export function resolveMarketingHref(href: string, localePrefix = ""): string {
  const normalized = normalizeShopMarketingLink(href);
  if (/^https?:\/\//i.test(normalized)) return normalized;
  if (normalized.startsWith("/shop")) {
    return localePrefix === "/en" ? `/en${normalized}` : normalized;
  }
  return `${localePrefix}${normalized.startsWith("/") ? normalized : `/${normalized}`}`;
}

export type ShopUrlRequestContext = {
  /** Value of Host or X-Forwarded-Host (first hop if comma-separated). */
  requestHost?: string;
  /** e.g. X-Forwarded-Proto; first value if comma-separated. */
  requestProto?: string;
  /** Shop UI locale for path prefix (default sq). */
  locale?: "sq" | "en";
};

/** Human-readable shop entry point for UI badges, e.g. `example.com/shop`. */
export function shopHostLabel(requestHost: string): string {
  try {
    const u = new URL(getPublicAppBaseUrl());
    return `${u.host}/shop`;
  } catch {
    /* fall through */
  }
  const hostname = requestHost.split(":")[0].split(",")[0].trim().toLowerCase().replace(/^shop\./, "");
  return hostname ? `${hostname}/shop` : "/shop";
}

function shopBaseFromRequestContext(ctx: ShopUrlRequestContext): string | null {
  const rawHost = ctx.requestHost?.split(",")[0].trim();
  if (!rawHost) return null;

  const protoFirst = (ctx.requestProto ?? "https").split(",")[0].trim().toLowerCase();
  const protocol: "http:" | "https:" = protoFirst === "http" ? "http:" : "https:";

  try {
    const u = new URL(`${protocol}//${rawHost}`);
    u.hostname = u.hostname.replace(/^shop\./i, "");
    u.pathname = "/shop";
    u.search = "";
    u.hash = "";
    return stripTrailingSlash(u.toString());
  } catch {
    return null;
  }
}

/** Public base for shop links (no trailing slash before path segments; ends with `/shop`). */
export function getShopBaseUrl(opts?: ShopUrlRequestContext): string {
  const explicit = process.env.NEXT_PUBLIC_SHOP_URL?.trim();
  if (explicit) return stripTrailingSlash(explicit);

  try {
    return `${getPublicAppBaseUrl()}/shop`;
  } catch {
    /* fall through */
  }

  if (opts?.requestHost) {
    const fromCtx = shopBaseFromRequestContext(opts);
    if (fromCtx) return fromCtx;
  }

  if (typeof window !== "undefined") {
    return stripTrailingSlash(`${window.location.origin}/shop`);
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const hostOnly = vercel.replace(/^https?:\/\//i, "").split("/")[0];
    if (hostOnly) {
      return stripTrailingSlash(`https://${hostOnly}/shop`);
    }
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000/shop";
  }

  return "http://localhost:3000/shop";
}

/**
 * Absolute URL to a shop route.
 * @param path — segment after shop root, e.g. "", "cart", "products/abc", "admin/products"
 */
export function shopUrl(path = "", opts?: ShopUrlRequestContext): string {
  const locale = opts?.locale ?? "sq";
  const origin = getPublicAppBaseUrl();
  const rel = shopPath(locale, path);
  return `${origin}${rel}`;
}

/**
 * @deprecated Use `shopPath` / `shopSwitchLocaleHref` — language is in the URL path, not `?lang=`.
 */
export function shopUrlWithLang(
  path = "",
  lang: "sq" | "en",
  opts?: ShopUrlRequestContext
): string {
  return shopUrl(path, { ...opts, locale: lang });
}

/** Main marketing site (not shop). @deprecated alias — use `getPublicAppBaseUrl`. */
export function getMainAppBaseUrl(): string {
  return getPublicAppBaseUrl();
}

export function mainSiteHostname(): string {
  try {
    return new URL(getPublicAppBaseUrl()).hostname;
  } catch {
    return "itarena.al";
  }
}

export function mainSiteUrl(path = "", locale: "sq" | "en" = "sq"): string {
  const base = getPublicAppBaseUrl();
  const prefix = locale === "en" ? "/en" : "";
  const p = path.replace(/^\/+/, "");
  if (!p) return `${base}${prefix}/`;
  return `${base}${prefix}/${p}`;
}

/**
 * Path for shop catalog query-string navigation (same-origin `/shop`).
 */
export function shopCatalogHref(
  params: Record<string, string | undefined>,
  locale: "sq" | "en" = "sq"
): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) search.set(k, v);
  }
  const q = search.toString();
  const base = shopPath(locale, "");
  return q ? `${base}?${q}` : base;
}

/** Page size for `/shop` catalog grid (server slices; total count stays full filtered length). */
export const SHOP_CATALOG_PAGE_SIZE = 24;

/** Shop catalog URL filtered by category slug. */
export function shopCategoryUrl(
  slug: string,
  opts?: ShopUrlRequestContext
): string {
  const locale = opts?.locale ?? "sq";
  const u = new URL(shopUrl("", { ...opts, locale }));
  u.searchParams.set("category", slug);
  return u.toString();
}
