export type BilingualString = { sq: string; en: string };

export type SiteGeneralSettings = {
  organizationName: string;
  defaultLocale: "sq" | "en";
  maintenanceMode: boolean;
  smtpNote: string;
};

export type SiteBrandingSettings = {
  logoUrl: string;
  logoWhiteUrl: string;
  faviconUrl: string;
  primaryColor: string;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  fontFamily: string;
  borderRadius: string;
  buttonStyle: "solid" | "gradient" | "outline";
};

export type HeroStat = { value: string; label: BilingualString; iconKey: string };

export type SiteHeroSettings = {
  badge: BilingualString;
  titleLine1: BilingualString;
  titleHighlight: BilingualString;
  titleLine2: BilingualString;
  subtitle: BilingualString;
  ctaPrimaryText: BilingualString;
  ctaPrimaryLink: string;
  ctaSecondaryText: BilingualString;
  ctaSecondaryLink: string;
  ctaTertiaryText: BilingualString;
  ctaTertiaryLink: string;
  backgroundImageUrl: string;
  overlayOpacity: number;
  gradientClass: string;
  animation: "none" | "fade" | "slide";
  quickStats: HeroStat[];
  bannerStats: HeroStat[];
};

export type SiteContactSettings = {
  companyName: string;
  email: string;
  phone: string;
  address: BilingualString;
  mapsUrl: string;
  businessHours: BilingualString;
};

export type SocialNetwork =
  | "facebook"
  | "instagram"
  | "linkedin"
  | "tiktok"
  | "youtube"
  | "twitter"
  | "whatsapp";

export type SocialLink = {
  network: SocialNetwork;
  url: string;
  enabled: boolean;
};

export type FooterLink = { label: BilingualString; href: string };

export type SiteFooterSettings = {
  description: BilingualString;
  copyright: BilingualString;
  ctaText: BilingualString;
  ctaLink: string;
  links: FooterLink[];
};

export type SiteSeoSettings = {
  defaultTitle: BilingualString;
  defaultDescription: BilingualString;
  keywords: BilingualString;
  ogImageUrl: string;
};

export type LandingSection = {
  id: string;
  type: string;
  enabled: boolean;
  title: BilingualString;
  subtitle: BilingualString;
  background: string;
  animation: string;
};

export type SiteLandingSettings = {
  sections: LandingSection[];
  industries: { name: BilingualString; icon: string }[];
};

export type SiteSettingsBundle = {
  general: SiteGeneralSettings;
  branding: SiteBrandingSettings;
  hero: SiteHeroSettings;
  contact: SiteContactSettings;
  social: { links: SocialLink[] };
  footer: SiteFooterSettings;
  seo: SiteSeoSettings;
  landing: SiteLandingSettings;
};

export type ServiceFeature = { sq: string; en: string };

export type MarketingServiceRecord = {
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
  featuresJson: ServiceFeature[];
};

export type TestimonialRecord = {
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
};

export type PublishedSiteContent = {
  settings: SiteSettingsBundle;
  services: MarketingServiceRecord[];
  testimonials: TestimonialRecord[];
};

export type SiteSettingsSectionKey =
  | "hero"
  | "contact"
  | "social"
  | "footer";
