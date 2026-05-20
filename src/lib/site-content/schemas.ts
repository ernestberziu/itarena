import { z } from "zod";

const bilingual = z.object({ sq: z.string(), en: z.string() });

export const generalSchema = z.object({
  organizationName: z.string().min(1).max(200),
  defaultLocale: z.enum(["sq", "en"]),
  maintenanceMode: z.boolean(),
  smtpNote: z.string().max(500),
});

export const brandingSchema = z.object({
  logoUrl: z.string().max(2000),
  logoWhiteUrl: z.string().max(2000),
  faviconUrl: z.string().max(2000),
  primaryColor: z.string().max(100),
  accentColor: z.string().max(100),
  gradientFrom: z.string().max(100),
  gradientTo: z.string().max(100),
  fontFamily: z.string().max(100),
  borderRadius: z.string().max(50),
  buttonStyle: z.enum(["solid", "gradient", "outline"]),
});

const heroStatSchema = z.object({
  value: z.string().max(50),
  label: bilingual,
  iconKey: z.string().max(80),
});

export const heroSchema = z.object({
  badge: bilingual,
  titleLine1: bilingual,
  titleHighlight: bilingual,
  titleLine2: bilingual,
  subtitle: bilingual,
  ctaPrimaryText: bilingual,
  ctaPrimaryLink: z.string().max(500),
  ctaSecondaryText: bilingual,
  ctaSecondaryLink: z.string().max(500),
  ctaTertiaryText: bilingual,
  ctaTertiaryLink: z.string().max(500),
  backgroundImageUrl: z.string().max(2000),
  overlayOpacity: z.number().min(0).max(1),
  gradientClass: z.string().max(200),
  animation: z.enum(["none", "fade", "slide"]),
  quickStats: z.array(heroStatSchema).max(12),
  bannerStats: z.array(heroStatSchema).max(12),
});

export const contactSchema = z.object({
  companyName: z.string().min(1).max(200),
  email: z.string().email().or(z.literal("")),
  phone: z.string().max(50),
  address: bilingual,
  mapsUrl: z.string().max(2000),
  businessHours: bilingual,
});

export const socialSchema = z.object({
  links: z.array(
    z.object({
      network: z.enum([
        "facebook",
        "instagram",
        "tiktok",
        "youtube",
        "twitter",
        "whatsapp",
      ]),
      url: z.string().max(2000),
      enabled: z.boolean(),
    })
  ),
});

export const footerSchema = z.object({
  description: bilingual,
  copyright: bilingual,
  ctaText: bilingual,
  ctaLink: z.string().max(500),
  links: z.array(
    z.object({
      label: bilingual,
      href: z.string().max(500),
    })
  ),
});

export const seoSchema = z.object({
  defaultTitle: bilingual,
  defaultDescription: bilingual,
  keywords: bilingual,
  ogImageUrl: z.string().max(2000),
});

export const landingSchema = z.object({
  sections: z.array(
    z.object({
      id: z.string().min(1).max(80),
      type: z.string().max(80),
      enabled: z.boolean(),
      title: bilingual,
      subtitle: bilingual,
      background: z.string().max(200),
      animation: z.string().max(50),
    })
  ),
  industries: z.array(
    z.object({
      name: bilingual,
      icon: z.string().max(20),
    })
  ),
});

export const sectionSchemas = {
  hero: heroSchema,
  contact: contactSchema,
  social: socialSchema,
  footer: footerSchema,
} as const;

const featureSchema = z.object({ sq: z.string(), en: z.string() });

export const serviceCreateSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  enabled: z.boolean().optional(),
  featured: z.boolean().optional(),
  nameSq: z.string().min(1),
  nameEn: z.string().min(1),
  shortDescSq: z.string().min(1),
  shortDescEn: z.string().min(1),
  fullDescSq: z.string().nullable().optional(),
  fullDescEn: z.string().nullable().optional(),
  iconKey: z.string().min(1).max(80),
  imageUrl: z.string().nullable().optional(),
  bannerUrl: z.string().nullable().optional(),
  ctaTextSq: z.string().nullable().optional(),
  ctaTextEn: z.string().nullable().optional(),
  ctaLink: z.string().nullable().optional(),
  showOnHomepage: z.boolean().optional(),
  cardStyle: z.string().nullable().optional(),
  gradientClass: z.string().nullable().optional(),
  hoverEffect: z.string().nullable().optional(),
  colorClass: z.string().nullable().optional(),
  accentClass: z.string().nullable().optional(),
  metaTitleSq: z.string().nullable().optional(),
  metaTitleEn: z.string().nullable().optional(),
  metaDescSq: z.string().nullable().optional(),
  metaDescEn: z.string().nullable().optional(),
  keywordsSq: z.string().nullable().optional(),
  keywordsEn: z.string().nullable().optional(),
  featuresJson: z.array(featureSchema).optional(),
});

export const serviceUpdateSchema = serviceCreateSchema.partial().omit({ slug: true });

export const serviceReorderSchema = z.object({
  items: z.array(z.object({ id: z.string(), sortOrder: z.number().int().min(0) })),
});

export const testimonialCreateSchema = z.object({
  clientName: z.string().min(1).max(200),
  enabled: z.boolean().optional(),
  featured: z.boolean().optional(),
  roleSq: z.string().nullable().optional(),
  roleEn: z.string().nullable().optional(),
  companySq: z.string().nullable().optional(),
  companyEn: z.string().nullable().optional(),
  reviewSq: z.string().min(1),
  reviewEn: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  imageUrl: z.string().nullable().optional(),
  avatarColor: z.string().nullable().optional(),
  initials: z.string().max(4).nullable().optional(),
});

export const testimonialUpdateSchema = testimonialCreateSchema.partial();

export const testimonialReorderSchema = serviceReorderSchema;
