import { headers } from "next/headers";
import type { SeoLocale } from "@/lib/seo/config";

/** Server-side shop locale (set by proxy on `/shop` and `/en/shop` rewrites). */
export async function getShopLocaleServer(): Promise<"sq" | "en"> {
  const h = await headers();
  return h.get("x-shop-locale") === "en" ? "en" : "sq";
}

export function shopLocaleToSeo(locale: "sq" | "en"): SeoLocale {
  return locale;
}
