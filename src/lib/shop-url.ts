/**
 * Build absolute URLs for the IT Shop.
 * Prefer NEXT_PUBLIC_APP_URL / NEXT_PUBLIC_SHOP_URL in production.
 * Without them: derive shop.[current-host] from optional request headers (server),
 * the browser origin (client), VERCEL_URL, or local dev defaults.
 */

function stripTrailingSlash(s: string) {
  return s.replace(/\/$/, "");
}

export type ShopUrlRequestContext = {
  /** Value of Host or X-Forwarded-Host (first hop if comma-separated). */
  requestHost: string;
  /** e.g. X-Forwarded-Proto; first value if comma-separated. */
  requestProto?: string;
};

/** Hostname for shop links, e.g. itarena.al → shop.itarena.al; shop.* unchanged. */
export function shopHostnameForBase(hostname: string): string {
  const h = hostname.toLowerCase();
  if (h.startsWith("shop.")) return h;
  return `shop.${h.replace(/^www\./i, "")}`;
}

/** Short label for UI, e.g. "shop.example.com" from request Host header. */
export function shopHostLabel(requestHost: string): string {
  const hostname = requestHost.split(":")[0].split(",")[0].trim().toLowerCase();
  return shopHostnameForBase(hostname);
}

function buildShopBaseFromRequestContext(ctx: ShopUrlRequestContext): string | null {
  const rawHost = ctx.requestHost.split(",")[0].trim();
  if (!rawHost) return null;

  const protoFirst = (ctx.requestProto ?? "https").split(",")[0].trim().toLowerCase();
  const protocol: "http:" | "https:" = protoFirst === "http" ? "http:" : "https:";

  const colonIdx = rawHost.lastIndexOf(":");
  const looksLikePort =
    colonIdx > 0 && /^\d+$/.test(rawHost.slice(colonIdx + 1)) && !rawHost.startsWith("[");
  const hostname = looksLikePort ? rawHost.slice(0, colonIdx) : rawHost;
  const port = looksLikePort ? rawHost.slice(colonIdx + 1) : "";

  const h = hostname.toLowerCase();
  if (h === "localhost" || h === "127.0.0.1") {
    let portPart = port ? `:${port}` : "";
    if (!portPart && protocol === "http:") portPart = ":3000";
    return stripTrailingSlash(`${protocol}//shop.localhost${portPart}`);
  }

  const shopHostname = shopHostnameForBase(h);
  const defaultPort = protocol === "https:" ? "443" : "80";
  const portPart = port && port !== defaultPort ? `:${port}` : "";
  return stripTrailingSlash(`${protocol}//${shopHostname}${portPart}`);
}

/** Public base for shop links (no trailing slash). */
export function getShopBaseUrl(opts?: ShopUrlRequestContext): string {
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
      const shopHost = shopHostnameForBase(host);
      return `${u.protocol}//${shopHost}`;
    } catch {
      /* fall through */
    }
  }

  if (opts?.requestHost) {
    const fromCtx = buildShopBaseFromRequestContext(opts);
    if (fromCtx) return fromCtx;
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const hostOnly = vercel.replace(/^https?:\/\//i, "").split("/")[0];
    if (hostOnly) {
      return stripTrailingSlash(`https://shop.${hostOnly}`);
    }
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location;
    if (hostname.startsWith("shop.")) {
      return stripTrailingSlash(window.location.origin);
    }
    const shopH = shopHostnameForBase(hostname);
    const portPart =
      port && port !== "" && port !== "80" && port !== "443" ? `:${port}` : "";
    return stripTrailingSlash(`${protocol}//${shopH}${portPart}`);
  }

  if (process.env.NODE_ENV === "development") {
    return "http://shop.localhost:3000";
  }

  return "http://shop.localhost:3000";
}

/**
 * Absolute URL to a shop route.
 * @param path — segment after shop root, e.g. "", "cart", "products/abc", "admin/products"
 */
export function shopUrl(path = "", opts?: ShopUrlRequestContext): string {
  const base = getShopBaseUrl(opts);
  const p = path.replace(/^\/+/, "");
  if (!p) {
    return base.endsWith("/shop") ? base : `${base}/`;
  }
  return `${base}/${p}`;
}

/** Same as `shopUrl` but with `?lang=` for the shop UI toggle. */
export function shopUrlWithLang(
  path = "",
  lang: "sq" | "en",
  opts?: ShopUrlRequestContext
): string {
  const u = new URL(shopUrl(path, opts));
  if (lang === "en") u.searchParams.set("lang", "en");
  else u.searchParams.delete("lang");
  return u.toString();
}

/** Main marketing site (not shop). Used for links from the shop subdomain. */
export function getMainAppBaseUrl(): string {
  const app = process.env.NEXT_PUBLIC_APP_URL?.trim();
  return stripTrailingSlash(app || "https://itarena.al");
}

export function mainSiteHostname(): string {
  try {
    return new URL(getMainAppBaseUrl()).hostname;
  } catch {
    return "itarena.al";
  }
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
export function shopCategoryUrl(slug: string, opts?: ShopUrlRequestContext): string {
  const u = new URL(shopUrl("", opts));
  u.searchParams.set("category", slug);
  return u.toString();
}
