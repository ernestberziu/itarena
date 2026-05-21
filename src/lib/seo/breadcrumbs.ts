import type { SeoLocale } from "@/lib/seo/config";
import type { BreadcrumbItem } from "@/lib/seo/json-ld";

const LABELS = {
  home: { sq: "Kryefaqja", en: "Home" },
  services: { sq: "Shërbimet", en: "Services" },
  blog: { sq: "Blog", en: "Blog" },
  contact: { sq: "Kontakt", en: "Contact" },
  quote: { sq: "Kërko ofertë", en: "Get a quote" },
  about: { sq: "Rreth nesh", en: "About" },
  partners: { sq: "Partnerët", en: "Partners" },
  industries: { sq: "Industritë", en: "Industries" },
  market: { sq: "Tregu IT", en: "IT market" },
  remoteSupport: { sq: "Mbështetje remote", en: "Remote support" },
  privacy: { sq: "Privatësia", en: "Privacy" },
  terms: { sq: "Kushtet", en: "Terms" },
  cookies: { sq: "Cookies", en: "Cookies" },
  shop: { sq: "Dyqani", en: "Shop" },
} as const;

function label(key: keyof typeof LABELS, locale: SeoLocale): string {
  return LABELS[key][locale];
}

export function breadcrumbsFor(
  locale: SeoLocale,
  trail: Array<{ key?: keyof typeof LABELS; name?: string; path: string }>
): BreadcrumbItem[] {
  const base: BreadcrumbItem[] = [{ name: label("home", locale), path: "/" }];
  for (const item of trail) {
    base.push({
      name: item.name ?? (item.key ? label(item.key, locale) : ""),
      path: item.path,
    });
  }
  return base;
}
