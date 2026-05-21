import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SITE_URL, resolveOgImageUrl } from "@/lib/seo/config";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | IT Arena",
    default: "IT Arena — E Ardhmja juaj Dixhitale",
  },
  description:
    "IT Arena — Technology & Service. Zgjidhje IT profesionale për bizneset shqiptare.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    images: [{ url: resolveOgImageUrl(null) }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sq" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
