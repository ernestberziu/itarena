import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { auth } from "@/lib/auth";
import { ShopLayoutChrome } from "@/components/shop/shop-layout-chrome";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/seo/config";
import { getShopLocaleServer } from "@/lib/shop-locale-server";
import { getShopMessages } from "@/lib/i18n/shop-messages";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getShopLocaleServer();
  const meta = buildPageMetadata({ locale, page: "shop", shop: true });
  return {
    metadataBase: new URL(SITE_URL),
    ...meta,
    title: {
      template: "%s | IT Arena Shop",
      default: meta.title as string,
    },
  };
}

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth().catch(() => null);
  const locale = await getShopLocaleServer();
  const messages = getShopMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ShopLayoutChrome session={session}>{children}</ShopLayoutChrome>
    </NextIntlClientProvider>
  );
}
