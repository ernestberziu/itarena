import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { ShopLayoutChrome } from "@/components/shop/shop-layout-chrome";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/seo/config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...buildPageMetadata({ locale: "sq", page: "shop", shop: true }),
  title: {
    template: "%s | IT Arena Shop",
    default: "IT Arena Shop — Hardware, Software & Periferikë",
  },
};

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth().catch(() => null);

  return <ShopLayoutChrome session={session}>{children}</ShopLayoutChrome>;
}
