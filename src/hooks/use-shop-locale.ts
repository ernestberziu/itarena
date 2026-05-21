"use client";

import { usePathname } from "next/navigation";
import { getShopLocaleFromPathname, shopPath } from "@/lib/shop-url";

export function useShopLocale(): "sq" | "en" {
  const pathname = usePathname() ?? "";
  return getShopLocaleFromPathname(pathname);
}

/** Locale-aware relative path, e.g. `/shop/cart` or `/en/shop/cart`. */
export function useShopPath(subpath = ""): string {
  const locale = useShopLocale();
  return shopPath(locale, subpath);
}
