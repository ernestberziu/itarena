import type { Metadata } from "next";
import { getPublishedSiteContent } from "@/lib/site-content/db";
import { pickLocale } from "@/lib/site-content/locale";
import { HomePageClient } from "@/components/public/home-page-client";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { SeoLocale } from "@/lib/seo/config";
import { WebPageJsonLd } from "@/lib/seo/json-ld";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const loc = (locale === "en" ? "en" : "sq") as SeoLocale;
  const content = await getPublishedSiteContent();
  const seo = content.settings.seo;
  return buildPageMetadata({
    locale: loc,
    page: "home",
    path: "/",
    title: pickLocale(seo.defaultTitle, locale) || undefined,
    description: pickLocale(seo.defaultDescription, locale) || undefined,
    keywords: pickLocale(seo.keywords, locale) || undefined,
    ogImageUrl: seo.ogImageUrl || null,
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = (locale === "en" ? "en" : "sq") as SeoLocale;
  const content = await getPublishedSiteContent();
  const seo = content.settings.seo;
  const title = pickLocale(seo.defaultTitle, locale);
  const description = pickLocale(seo.defaultDescription, locale);

  return (
    <>
      <WebPageJsonLd locale={loc} name={title} description={description} path="/" />
      <HomePageClient content={content} />
    </>
  );
}
