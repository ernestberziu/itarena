import type { Metadata } from "next";
import {
  OG_LOCALE,
  SITE_NAME,
  resolveOgImageUrl,
  type SeoLocale,
} from "@/lib/seo/config";
import { STATIC_PAGE_SEO, type PageSeoEntry } from "@/lib/seo/page-registry";
import { alternatesForPath, absoluteUrl, shopAbsoluteUrl, shopAlternatesForPath } from "@/lib/seo/urls";

export type BuildPageMetadataInput = {
  locale: SeoLocale;
  /** Registry key or inline entry */
  page?: keyof typeof STATIC_PAGE_SEO;
  path?: string;
  title?: string;
  description?: string;
  keywords?: string | string[];
  ogImageUrl?: string | null;
  ogType?: "website" | "article";
  /** Override canonical path for alternates (defaults to registry path or `path`) */
  alternatePath?: string;
  robots?: { index?: boolean; follow?: boolean };
  /** Use shop URL builder (no locale prefix) */
  shop?: boolean;
};

function pickBilingual(
  field: { sq: string; en: string },
  locale: SeoLocale
): string {
  return locale === "en" ? field.en : field.sq;
}

function entryFromInput(input: BuildPageMetadataInput): {
  path: string;
  title: string;
  description: string;
  keywords?: string | string[];
  ogType?: "website" | "article";
} {
  const locale = input.locale;
  let entry: PageSeoEntry | null = null;
  if (input.page) {
    entry = STATIC_PAGE_SEO[input.page];
  }

  const path = input.alternatePath ?? input.path ?? entry?.path ?? "/";
  const title =
    input.title ??
    (entry ? pickBilingual(entry.title, locale) : SITE_NAME);
  const description =
    input.description ??
    (entry ? pickBilingual(entry.description, locale) : "");
  const keywords =
    input.keywords ??
    (entry?.keywords ? pickBilingual(entry.keywords, locale) : undefined);
  const ogType = input.ogType ?? entry?.ogType ?? "website";

  return { path, title, description, keywords, ogType };
}

export function buildPageMetadata(input: BuildPageMetadataInput): Metadata {
  const locale = input.locale;
  const { path, title, description, keywords, ogType } = entryFromInput(input);

  const index = input.robots?.index ?? true;
  const follow = input.robots?.follow ?? true;

  const alternates = input.shop
    ? shopAlternatesForPath(path, locale)
    : alternatesForPath(path);

  const pageUrl = input.shop
    ? alternates.canonical
    : absoluteUrl(locale, path);
  const ogImage = resolveOgImageUrl(input.ogImageUrl);
  const altLocale = locale === "sq" ? OG_LOCALE.en : OG_LOCALE.sq;

  const keywordList =
    typeof keywords === "string"
      ? keywords.split(",").map((k) => k.trim()).filter(Boolean)
      : keywords;

  return {
    title,
    description,
    keywords: keywordList,
    alternates,
    robots: {
      index,
      follow,
      googleBot: { index, follow },
    },
    openGraph: {
      type: ogType === "article" ? "article" : "website",
      title,
      description,
      url: pageUrl,
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale],
      alternateLocale: [altLocale],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
