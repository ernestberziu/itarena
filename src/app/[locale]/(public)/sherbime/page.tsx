import type { Metadata } from "next";
import { getPublishedSiteContent } from "@/lib/site-content/db";
import { ServicesPageClient } from "@/components/public/services/services-page-client";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { SeoLocale } from "@/lib/seo/config";
import { BreadcrumbJsonLd } from "@/lib/seo/json-ld";
import { breadcrumbsFor } from "@/lib/seo/breadcrumbs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const loc = (locale === "en" ? "en" : "sq") as SeoLocale;
  const content = await getPublishedSiteContent();
  return buildPageMetadata({
    locale: loc,
    page: "services",
    ogImageUrl: content.settings.seo.ogImageUrl,
  });
}

export default async function SherbimePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const content = await getPublishedSiteContent();
  const lp = locale === "sq" ? "" : `/${locale}`;
  const services = content.services.filter((s) => s.enabled);

  const loc = (locale === "en" ? "en" : "sq") as SeoLocale;

  return (
    <>
      <BreadcrumbJsonLd
        locale={loc}
        items={breadcrumbsFor(loc, [{ key: "services", path: "/sherbime" }])}
      />
      <ServicesPageClient services={services} locale={locale} lp={lp} />
    </>
  );
}
