import { getPublicAppBaseUrl } from "@/lib/shop-url";

export const EMAIL_FONT_STACK =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

export const emailColors = {
  canvas: "#f1f5f9",
  card: "#ffffff",
  cardBorder: "#e2e8f0",
  text: "#0f172a",
  textSoft: "#334155",
  muted: "#64748b",
  brand: "#1400D4",
  brandDark: "#0f00a8",
  brandOnDark: "#a5b4fc",
  ctaBg: "#1400D4",
  ctaFg: "#ffffff",
  link: "#1400D4",
  insetBg: "#f8fafc",
  codeBg: "#e2e8f0",
  passwordAccent: "#c7d2fe",
} as const;

export const BRAND_NAME = "IT Arena";

export function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function absoluteUrl(path: string): string {
  const base = getPublicAppBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export function loginUrl(locale?: "sq" | "en"): string {
  const loc = locale === "en" ? "en" : "sq";
  return absoluteUrl(`/${loc}/hyr`);
}

export type EmailLocale = "sq" | "en";

export function pickLocale(language: string | null | undefined): EmailLocale {
  return language === "en" ? "en" : "sq";
}
