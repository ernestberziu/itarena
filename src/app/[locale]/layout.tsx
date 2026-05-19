import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { SetHtmlLang } from "@/components/public/set-html-lang";

export const metadata: Metadata = {
  title: {
    template: "%s | IT Arena",
    default: "IT Arena — Zgjidhje Teknologjike për Biznesin Tuaj",
  },
  description:
    "IT Arena sjell zgjidhje teknologjike të plota për bizneset shqiptare. IT Support, Cloud, Web, CCTV dhe më shumë.",
  keywords: ["IT Arena", "IT Support Albania", "Cloud Albania", "CCTV Albania"],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://itarena.al"
  ),
  openGraph: {
    siteName: "IT Arena",
    locale: "sq_AL",
    alternateLocale: "en_US",
  },
};

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
