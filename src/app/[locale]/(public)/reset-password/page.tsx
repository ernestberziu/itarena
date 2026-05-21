import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { ItArenaLogo } from "@/components/brand/logo";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { SeoLocale } from "@/lib/seo/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale: (locale === "en" ? "en" : "sq") as SeoLocale,
    page: "resetPassword",
    robots: { index: false, follow: false },
  });
}

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <ItArenaLogo className="h-8" />
        </div>
        <h1 className="mb-6 text-center text-xl font-bold">{t("reset_password")}</h1>
        <Suspense fallback={<p className="text-center text-sm text-muted-foreground">…</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
