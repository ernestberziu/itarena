import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const loc = locale === "en" ? "en" : "sq";
  return buildPageMetadata({
    locale: loc,
    page: "sharePrivate",
    robots: { index: false, follow: false },
  });
}

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
