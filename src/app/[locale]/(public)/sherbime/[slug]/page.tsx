import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  getMarketingServiceBySlug,
  getPublishedSiteContent,
  listMarketingServices,
} from "@/lib/site-content/db";
import {
  serviceName,
  serviceShortDesc,
  serviceFullDesc,
} from "@/lib/site-content/locale";
import { DEFAULT_MARKETING_SERVICES } from "@/lib/site-content/defaults";
import { ServiceDetailView } from "@/components/public/services/service-detail-view";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { SeoLocale } from "@/lib/seo/config";
import { BreadcrumbJsonLd, ServiceJsonLd } from "@/lib/seo/json-ld";
import { breadcrumbsFor } from "@/lib/seo/breadcrumbs";

const PRINTER_SLUG = "printere" as const;
const LEGACY_PRINTER_SLUG = "printerë";

function resolveServiceSlug(slug: string): string {
  if (slug.normalize("NFC") === LEGACY_PRINTER_SLUG.normalize("NFC")) {
    return PRINTER_SLUG;
  }
  return slug;
}

export async function generateStaticParams() {
  if (!process.env.DATABASE_URL?.trim()) {
    return DEFAULT_MARKETING_SERVICES.map((s) => ({ slug: s.slug }));
  }
  try {
    const services = await listMarketingServices(false);
    if (services.length > 0) {
      return services.map((s) => ({ slug: s.slug }));
    }
  } catch {
    /* build without DB */
  }
  return DEFAULT_MARKETING_SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const loc = (locale === "en" ? "en" : "sq") as SeoLocale;
  const resolved = resolveServiceSlug(slug);
  const svc = await getMarketingServiceBySlug(resolved);
  if (!svc) return { title: "IT Arena" };
  const title =
    (locale === "en" ? svc.metaTitleEn : svc.metaTitleSq) || serviceName(svc, locale);
  const description =
    (locale === "en" ? svc.metaDescEn : svc.metaDescSq) || serviceShortDesc(svc, locale);
  const keywords = locale === "en" ? svc.keywordsEn : svc.keywordsSq;
  return buildPageMetadata({
    locale: loc,
    path: `/sherbime/${resolved}`,
    alternatePath: `/sherbime/${resolved}`,
    title,
    description,
    keywords: keywords ?? undefined,
    ogImageUrl: svc.imageUrl || svc.bannerUrl,
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const resolved = resolveServiceSlug(slug);
  if (resolved !== slug) {
    redirect(locale === "sq" ? `/sherbime/${resolved}` : `/${locale}/sherbime/${resolved}`);
  }

  const svc = await getMarketingServiceBySlug(resolved);
  if (!svc) notFound();

  const content = await getPublishedSiteContent();
  const lp = locale === "sq" ? "" : `/${locale}`;
  const related = content.services
    .filter((s) => s.enabled && s.slug !== svc.slug)
    .slice(0, 4);

  const loc = (locale === "en" ? "en" : "sq") as SeoLocale;
  const name = serviceName(svc, locale);
  const description = serviceShortDesc(svc, locale);

  return (
    <>
      <BreadcrumbJsonLd
        locale={loc}
        items={breadcrumbsFor(loc, [
          { key: "services", path: "/sherbime" },
          { name, path: `/sherbime/${svc.slug}` },
        ])}
      />
      <ServiceJsonLd
        locale={loc}
        name={name}
        description={serviceFullDesc(svc, locale)}
        slug={svc.slug}
      />
      <ServiceDetailView svc={svc} related={related} locale={locale} lp={lp} />
    </>
  );
}
