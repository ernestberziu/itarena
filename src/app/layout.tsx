import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | IT Arena",
    default: "IT Arena — E Ardhmja juaj Dixhitale",
  },
  description: "IT Arena — Technology & Service. E Ardhmja juaj Dixhitale! Zgjidhje IT profesionale për bizneset shqiptare.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://itarena.al"
  ),
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
