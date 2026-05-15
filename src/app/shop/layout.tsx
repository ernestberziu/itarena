import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { ShopLayoutChrome } from "@/components/shop/shop-layout-chrome";

export const metadata: Metadata = {
  title: {
    template: "%s | IT Arena Shop",
    default: "IT Arena Shop — Hardware, Software & Periferikë",
  },
  description:
    "Dyqani online i IT Arena. Kompjuterë, serverë, rrjete dhe gjithçka tjetër me dorëzim dhe pagesa me dorëzim (COD).",
};

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth().catch(() => null);

  return <ShopLayoutChrome session={session}>{children}</ShopLayoutChrome>;
}
