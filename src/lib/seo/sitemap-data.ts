/**
 * Single sitemap source for the whole site: marketing pages (sq + en) and shop (/shop, /en/shop).
 * Consumed only by `src/app/sitemap.ts` → https://itarena.al/sitemap.xml
 */

import { BLOG_ARTICLES } from "@/lib/blog/articles";
import { STATIC_PAGE_SEO, type PageSeoEntry } from "@/lib/seo/page-registry";
import { alternatesForPath } from "@/lib/seo/urls";
import { getPublishedSiteContent } from "@/lib/site-content/db";
import { DEFAULT_MARKETING_SERVICES } from "@/lib/site-content/defaults";
import { getFinanca5Client } from "@/lib/financa5-client";

/** Public marketing routes from the page registry (includes `/shop`). */
const MARKETING_PAGE_KEYS = [
  "home",
  "services",
  "contact",
  "quote",
  "about",
  "partners",
  "industries",
  "market",
  "remoteSupport",
  "blog",
  "shop",
  "legalPrivacy",
  "legalTerms",
  "legalCookies",
] as const;

export type SitemapEntry = {
  url: string;
  lastModified?: Date;
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
  alternates?: { languages: Record<string, string> };
};

function pushBilingualEntry(
  entries: SitemapEntry[],
  path: string,
  opts: {
    lastModified: Date;
    changeFrequency: NonNullable<SitemapEntry["changeFrequency"]>;
    priority: number;
  }
) {
  const alts = alternatesForPath(path);
  entries.push({
    url: alts.canonical,
    alternates: { languages: alts.languages },
    lastModified: opts.lastModified,
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
  });
}

async function collectMarketingEntries(now: Date): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = [];

  for (const key of MARKETING_PAGE_KEYS) {
    const page: PageSeoEntry = STATIC_PAGE_SEO[key];
    const priority =
      key === "home"
        ? 1
        : key === "services" || key === "contact" || key === "quote"
          ? 0.9
          : key === "shop"
            ? 0.85
            : 0.7;
    const changeFrequency =
      key === "blog"
        ? ("weekly" as const)
        : key === "shop"
          ? ("daily" as const)
          : key.startsWith("legal")
            ? ("yearly" as const)
            : ("monthly" as const);

    pushBilingualEntry(entries, page.path, { lastModified: now, changeFrequency, priority });
  }

  let services = DEFAULT_MARKETING_SERVICES;
  try {
    const content = await getPublishedSiteContent();
    services = content.services.filter((s) => s.enabled);
  } catch {
    /* build without DB */
  }

  for (const svc of services) {
    pushBilingualEntry(entries, `/sherbime/${svc.slug}`, {
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  for (const art of BLOG_ARTICLES) {
    pushBilingualEntry(entries, `/blog/${art.slug}`, {
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}

async function collectShopProductEntries(now: Date): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = [];

  try {
    const client = getFinanca5Client();
    const products = await client.getAllProducts();
    const cap = 500;
    for (const p of products.slice(0, cap)) {
      const kod = p.kod ?? (p as { KOD?: string }).KOD;
      if (!kod) continue;
      pushBilingualEntry(entries, `/shop/products/${encodeURIComponent(kod)}`, {
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
  } catch {
    /* ERP unavailable at build */
  }

  return entries;
}

/** All indexable URLs for one combined sitemap.xml (website + shop). */
export async function collectSitemapEntries(): Promise<SitemapEntry[]> {
  const now = new Date();
  const [marketing, shopProducts] = await Promise.all([
    collectMarketingEntries(now),
    collectShopProductEntries(now),
  ]);

  const combined = [...marketing, ...shopProducts];
  combined.sort((a, b) => a.url.localeCompare(b.url));
  return combined;
}
