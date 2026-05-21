import { getPublicAppBaseUrl } from "@/lib/shop-url";

export const SITE_NAME = "IT Arena";
export const SITE_URL = getPublicAppBaseUrl();

/** Square logo for Organization schema (Google site icon / knowledge panel). */
export const DEFAULT_LOGO_PATH = "/logo-512.png";
export const DEFAULT_OG_IMAGE_PATH = "/opengraph-image";

export const ORGANIZATION = {
  legalName: "IT Arena sh.p.k",
  nipt: "M11905015A",
  email: "info@itarena.al",
  privacyEmail: "privacy@itarena.al",
  phone: "+355696314319",
  address: {
    sq: "Rr. Loni Ligori, Astir, Tiranë, Shqipëri",
    en: "Rr. Loni Ligori, Astir, Tirana, Albania",
  },
  geo: {
    latitude: 41.3275,
    longitude: 19.8187,
  },
} as const;

export type SeoLocale = "sq" | "en";

export const OG_LOCALE: Record<SeoLocale, string> = {
  sq: "sq_AL",
  en: "en_US",
};

export function absoluteAsset(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

export function resolveLogoUrl(cmsLogoUrl?: string | null): string {
  const trimmed = cmsLogoUrl?.trim();
  if (trimmed) {
    return trimmed.startsWith("http") ? trimmed : absoluteAsset(trimmed);
  }
  return absoluteAsset(DEFAULT_LOGO_PATH);
}

export function resolveOgImageUrl(cmsOgUrl?: string | null): string {
  const trimmed = cmsOgUrl?.trim();
  if (trimmed) {
    return trimmed.startsWith("http") ? trimmed : absoluteAsset(trimmed);
  }
  return absoluteAsset(DEFAULT_OG_IMAGE_PATH);
}
