import type { BilingualString, MarketingServiceRecord } from "./types";

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
