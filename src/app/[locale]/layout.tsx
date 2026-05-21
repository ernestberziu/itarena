import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { SetHtmlLang } from "@/components/public/set-html-lang";

import { SITE_URL, resolveOgImageUrl } from "@/lib/seo/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  const ogLocale = locale === "en" ? "en_US" : "sq_AL";
  const altLocale = locale === "en" ? "sq_AL" : "en_US";
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      template: "%s | IT Arena",
      default: t("titleDefault"),
    },
    description: t("descriptionDefault"),
    keywords: t("keywords").split(", "),
    icons: {
      icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/apple-icon", type: "image/png" }],
    },
    manifest: "/manifest.webmanifest",
    openGraph: {
      siteName: "IT Arena",
      locale: ogLocale,
      alternateLocale: [altLocale],
      images: [{ url: resolveOgImageUrl(null), width: 1200, height: 630, alt: "IT Arena" }],
    },
    twitter: {
      card: "summary_large_image",
      images: [resolveOgImageUrl(null)],
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "sq" | "en")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <SetHtmlLang />
      <TooltipProvider>
        {children}
        <Toaster position="top-right" richColors />
      </TooltipProvider>
    </NextIntlClientProvider>
  );
}
