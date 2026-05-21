import type { BilingualString, MarketingServiceRecord } from "./types";
import { SERVICE_DETAIL_FALLBACK } from "./service-detail-fallback";

export function pickLocale(field: BilingualString, locale: string): string {
  return locale === "en" ? field.en : field.sq;
}

export function serviceName(s: MarketingServiceRecord, locale: string): string {
  return locale === "en" ? s.nameEn : s.nameSq;
}

export function serviceShortDesc(s: MarketingServiceRecord, locale: string): string {
  return locale === "en" ? s.shortDescEn : s.shortDescSq;
}

export function serviceFeatures(s: MarketingServiceRecord, locale: string): string[] {
  return s.featuresJson.map((f) => (locale === "en" ? f.en : f.sq));
}

export function serviceFullDesc(s: MarketingServiceRecord, locale: string): string {
  const custom = locale === "en" ? s.fullDescEn : s.fullDescSq;
  if (custom?.trim()) return custom.trim();
  const fb = SERVICE_DETAIL_FALLBACK[s.slug];
  if (fb) return locale === "en" ? fb.en : fb.sq;
  return serviceShortDesc(s, locale);
}
