import { routing } from "@/i18n/routing";
import { SITE_URL, type SeoLocale } from "@/lib/seo/config";

/** Path without locale prefix, always starts with `/` (use `/` for home). */
export function localePath(locale: SeoLocale, path: string): string {
  const normalized = path === "" || path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  if (locale === routing.defaultLocale) {
    return normalized || "/";
  }
  return normalized ? `/${locale}${normalized}` : `/${locale}`;
}

export function absoluteUrl(locale: SeoLocale, path: string): string {
  const p = localePath(locale, path);
  return `${SITE_URL}${p === "/" ? "" : p}`;
}

export function alternatesForPath(path: string): {
  canonical: string;
  languages: Record<string, string>;
} {
  const sq = absoluteUrl("sq", path);
  const en = absoluteUrl("en", path);
  return {
    canonical: sq,
    languages: {
      sq,
      en,
      "x-default": sq,
    },
  };
}

/** Shop lives outside locale routing — canonical is apex `/shop`. */
export function shopAbsoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

/** Normalize to Albanian shop path (`/shop`, `/shop/products/...`). */
function shopSqPath(path: string): string {
  if (path.startsWith("/en/shop")) {
    const sub = path.slice("/en/shop".length).replace(/^\//, "");
    return sub ? `/shop/${sub}` : "/shop";
  }
  if (path.startsWith("/shop")) return path;
  return path ? `/shop/${path.replace(/^\/+/, "")}` : "/shop";
}

/** hreflang alternates for shop (`/shop` vs `/en/shop`). */
export function shopAlternatesForPath(
  path: string,
  canonicalLocale: SeoLocale
): {
  canonical: string;
  languages: Record<string, string>;
} {
  const sqPath = shopSqPath(path);
  const sub = sqPath === "/shop" ? "" : sqPath.slice("/shop/".length);
  const sqUrl = shopAbsoluteUrl(sqPath);
  const enUrl = shopAbsoluteUrl(sub ? `/en/shop/${sub}` : "/en/shop");
  return {
    canonical: canonicalLocale === "en" ? enUrl : sqUrl,
    languages: {
      sq: sqUrl,
      en: enUrl,
      "x-default": sqUrl,
    },
  };
}
