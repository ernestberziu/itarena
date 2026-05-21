import {
  ORGANIZATION,
  SITE_NAME,
  SITE_URL,
  resolveLogoUrl,
  type SeoLocale,
} from "@/lib/seo/config";
import { absoluteUrl } from "@/lib/seo/urls";
import type { SocialLink } from "@/lib/site-content/types";

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export function JsonLd({ data }: JsonLdProps) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload.length === 1 ? payload[0] : payload) }}
    />
  );
}

export function OrganizationWebSiteJsonLd({
  logoUrl,
  socialLinks,
}: {
  logoUrl?: string | null;
  socialLinks?: SocialLink[];
}) {
  const logo = resolveLogoUrl(logoUrl);
  const sameAs =
    socialLinks
      ?.filter((l) => l.enabled && l.url.trim())
      .map((l) => l.url.trim()) ?? [];

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: ORGANIZATION.legalName,
    url: SITE_URL,
    logo,
    email: ORGANIZATION.email,
    telephone: ORGANIZATION.phone,
    taxID: ORGANIZATION.nipt,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Rr. Loni Ligori, Astir",
      addressLocality: "Tirana",
      addressCountry: "AL",
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: ["sq-AL", "en"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#localbusiness`,
    name: SITE_NAME,
    image: logo,
    url: SITE_URL,
    telephone: ORGANIZATION.phone,
    email: ORGANIZATION.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Rr. Loni Ligori, Astir",
      addressLocality: "Tirana",
      addressCountry: "AL",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: ORGANIZATION.geo.latitude,
      longitude: ORGANIZATION.geo.longitude,
    },
    priceRange: "$$",
    areaServed: { "@type": "Country", name: "Albania" },
  };

  return <JsonLd data={[organization, website, localBusiness]} />;
}

export type BreadcrumbItem = { name: string; path: string };

export function BreadcrumbJsonLd({
  locale,
  items,
}: {
  locale: SeoLocale;
  items: BreadcrumbItem[];
}) {
  const list = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(locale, item.path),
    })),
  };
  return <JsonLd data={list} />;
}

export function ServiceJsonLd({
  locale,
  name,
  description,
  slug,
}: {
  locale: SeoLocale;
  name: string;
  description: string;
  slug: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: { "@type": "Country", name: "Albania" },
    url: absoluteUrl(locale, `/sherbime/${slug}`),
  };
  return <JsonLd data={data} />;
}

export function ArticleJsonLd({
  locale,
  title,
  description,
  slug,
  image,
  datePublished,
  authorName,
}: {
  locale: SeoLocale;
  title: string;
  description: string;
  slug: string;
  image?: string;
  datePublished?: string;
  authorName?: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: image ? [image] : undefined,
    datePublished: datePublished ?? "2026-01-01",
    author: authorName
      ? { "@type": "Person", name: authorName }
      : { "@type": "Organization", name: SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: resolveLogoUrl(null) },
    },
    mainEntityOfPage: absoluteUrl(locale, `/blog/${slug}`),
    inLanguage: locale === "sq" ? "sq-AL" : "en",
  };
  return <JsonLd data={data} />;
}

export function ProductJsonLd({
  name,
  description,
  sku,
  url,
  image,
  price,
  currency = "EUR",
  availability = "https://schema.org/InStock",
}: {
  name: string;
  description?: string;
  sku: string;
  url: string;
  image?: string;
  price?: number;
  currency?: string;
  availability?: string;
}) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    sku,
    url,
    image,
    brand: { "@type": "Brand", name: SITE_NAME },
  };
  if (price != null && price > 0) {
    data.offers = {
      "@type": "Offer",
      price,
      priceCurrency: currency,
      availability,
      url,
    };
  }
  return <JsonLd data={data} />;
}

export function WebPageJsonLd({
  locale,
  name,
  description,
  path,
}: {
  locale: SeoLocale;
  name: string;
  description: string;
  path: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url: absoluteUrl(locale, path),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    inLanguage: locale === "sq" ? "sq-AL" : "en",
  };
  return <JsonLd data={data} />;
}
