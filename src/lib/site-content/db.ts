import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import {
  DEFAULT_MARKETING_SERVICES,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_TESTIMONIALS,
} from "./defaults";
import type {
  MarketingServiceRecord,
  PublishedSiteContent,
  SiteSettingsBundle,
  SiteSettingsSectionKey,
  TestimonialRecord,
} from "./types";
import { sectionSchemas } from "./schemas";

function parseJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  return value as T;
}

function mapService(row: {
  id: string;
  slug: string;
  sortOrder: number;
  enabled: boolean;
  featured: boolean;
  nameSq: string;
  nameEn: string;
  shortDescSq: string;
  shortDescEn: string;
  fullDescSq: string | null;
  fullDescEn: string | null;
  iconKey: string;
  imageUrl: string | null;
  bannerUrl: string | null;
  ctaTextSq: string | null;
  ctaTextEn: string | null;
  ctaLink: string | null;
  showOnHomepage: boolean;
  cardStyle: string | null;
  gradientClass: string | null;
  hoverEffect: string | null;
  colorClass: string | null;
  accentClass: string | null;
  metaTitleSq: string | null;
  metaTitleEn: string | null;
  metaDescSq: string | null;
  metaDescEn: string | null;
  keywordsSq: string | null;
  keywordsEn: string | null;
  featuresJson: unknown;
}): MarketingServiceRecord {
  return {
    ...row,
    featuresJson: parseJson(row.featuresJson, []),
  };
}

function mapTestimonial(row: {
  id: string;
  sortOrder: number;
  enabled: boolean;
  featured: boolean;
  clientName: string;
  roleSq: string | null;
  roleEn: string | null;
  companySq: string | null;
  companyEn: string | null;
  reviewSq: string;
  reviewEn: string;
  rating: number;
  imageUrl: string | null;
  avatarColor: string | null;
  initials: string | null;
}): TestimonialRecord {
  return row;
}

function rowToBundle(row: {
  generalJson: unknown;
  brandingJson: unknown;
  heroJson: unknown;
  contactJson: unknown;
  socialJson: unknown;
  footerJson: unknown;
  seoJson: unknown;
  landingJson: unknown;
}): SiteSettingsBundle {
  const d = DEFAULT_SITE_SETTINGS;
  return {
    general: parseJson(row.generalJson, d.general),
    branding: parseJson(row.brandingJson, d.branding),
    hero: parseJson(row.heroJson, d.hero),
    contact: parseJson(row.contactJson, d.contact),
    social: parseJson(row.socialJson, d.social),
    footer: parseJson(row.footerJson, d.footer),
    seo: parseJson(row.seoJson, d.seo),
    landing: parseJson(row.landingJson, d.landing),
  };
}

export async function ensureSiteSettingsRow(): Promise<void> {
  const existing = await db.siteSettings.findUnique({ where: { id: "default" } });
  if (existing) return;

  const d = DEFAULT_SITE_SETTINGS;
  await db.siteSettings.create({
    data: {
      id: "default",
      generalJson: d.general,
      brandingJson: d.branding,
      heroJson: d.hero,
      contactJson: d.contact,
      socialJson: d.social,
      footerJson: d.footer,
      seoJson: d.seo,
      landingJson: d.landing,
    },
  });
}

export async function getSiteSettingsBundle(): Promise<SiteSettingsBundle> {
  await ensureSiteSettingsRow();
  const row = await db.siteSettings.findUniqueOrThrow({ where: { id: "default" } });
  return rowToBundle(row);
}

export async function patchSiteSettingsSection(
  section: SiteSettingsSectionKey,
  payload: unknown
): Promise<SiteSettingsBundle> {
  const schema = sectionSchemas[section];
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new Error("Invalid section payload");
  }

  await ensureSiteSettingsRow();
  const fieldMap: Record<SiteSettingsSectionKey, string> = {
    hero: "heroJson",
    contact: "contactJson",
    social: "socialJson",
    footer: "footerJson",
  };

  const row = await db.siteSettings.update({
    where: { id: "default" },
    data: { [fieldMap[section]]: parsed.data },
  });

  return rowToBundle(row);
}

export async function listMarketingServices(admin = false): Promise<MarketingServiceRecord[]> {
  const rows = await db.marketingService.findMany({
    where: admin ? undefined : { enabled: true },
    orderBy: { sortOrder: "asc" },
  });
  if (rows.length === 0 && !admin) {
    return DEFAULT_MARKETING_SERVICES.map((s, i) => ({
      ...s,
      id: `default-${s.slug}`,
    }));
  }
  return rows.map(mapService);
}

export async function getMarketingServiceBySlug(
  slug: string
): Promise<MarketingServiceRecord | null> {
  const row = await db.marketingService.findFirst({
    where: { slug, enabled: true },
  });
  if (row) return mapService(row);
  const fallback = DEFAULT_MARKETING_SERVICES.find((s) => s.slug === slug);
  if (!fallback) return null;
  return { ...fallback, id: `default-${fallback.slug}` };
}

export async function listTestimonials(admin = false): Promise<TestimonialRecord[]> {
  const rows = await db.testimonial.findMany({
    where: admin ? undefined : { enabled: true },
    orderBy: { sortOrder: "asc" },
  });
  if (rows.length === 0 && !admin) {
    return DEFAULT_TESTIMONIALS.map((t, i) => ({
      ...t,
      id: `default-t-${i}`,
    }));
  }
  return rows.map(mapTestimonial);
}

async function fetchPublishedSiteContent(): Promise<PublishedSiteContent> {
  const [settings, services, testimonials] = await Promise.all([
    getSiteSettingsBundle(),
    listMarketingServices(false),
    listTestimonials(false),
  ]);
  return { settings, services, testimonials };
}

export const getPublishedSiteContent = unstable_cache(
  fetchPublishedSiteContent,
  ["published-site-content"],
  { revalidate: 60, tags: ["site-content"] }
);

export { pickLocale, serviceName, serviceShortDesc, serviceFeatures } from "./locale";
