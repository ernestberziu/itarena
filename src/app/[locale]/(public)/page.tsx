import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getPublishedSiteContent } from "@/lib/site-content/db";
import { pickLocale } from "@/lib/site-content/locale";
import { HomePageClient } from "@/components/public/home-page-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const content = await getPublishedSiteContent();
  const seo = content.settings.seo;
  return {
    title: pickLocale(seo.defaultTitle, locale),
    description: pickLocale(seo.defaultDescription, locale),
  };
}

export default async function HomePage() {
  const content = await getPublishedSiteContent();
  return <HomePageClient content={content} />;
}
