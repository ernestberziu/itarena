import type { MetadataRoute } from "next";
import { collectSitemapEntries } from "@/lib/seo/sitemap-data";

/** One sitemap for marketing (`/`, `/en/...`) and shop (`/shop`, `/en/shop`, products). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await collectSitemapEntries();
  return entries.map((e) => ({
    url: e.url,
    lastModified: e.lastModified,
    changeFrequency: e.changeFrequency,
    priority: e.priority,
    ...(e.alternates ? { alternates: e.alternates } : {}),
  }));
}
