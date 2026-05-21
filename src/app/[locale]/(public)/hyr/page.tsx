import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/auth/login-form";
import { Shield, Zap, HeadphonesIcon, ShoppingBag, Bell } from "lucide-react";
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
    page: "login",
    robots: { index: false, follow: false },
  });
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const features = [
    {
      icon: HeadphonesIcon,
      sq: "Hapni dhe gjurmoni biletat e mbështetjes",
      en: "Open and track support tickets",
    },
    {
      icon: ShoppingBag,
      sq: "Blerje online me dorëzim dhe COD",
      en: "Online purchases with delivery & COD",
    },
    {
      icon: Zap,
      sq: "Kërkesa ofertash B2B të personalizuara",
      en: "Personalised B2B quote requests",
    },
    {
      icon: Bell,
      sq: "Njoftimet në kohë reale për çdo aktivitet",
      en: "Real-time notifications for every activity",
    },
  ];

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
      {/* ── Left brand panel ─────────────────────────────── */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[hsl(222,47%,8%)] px-14 py-12">
        {/* glow orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 right-0 h-[640px] w-[640px] rounded-full bg-primary/30 blur-[130px]" />
          <div className="absolute bottom-0 -left-20 h-[420px] w-[420px] rounded-full bg-amber-500/15 blur-[110px]" />
        </div>

        {/* logo */}
        <div className="relative z-10">
          <ItArenaLogo variant="dark" size="md" showTagline />
        </div>

        {/* copy */}
        <div className="relative z-10 space-y-8">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary/80">
              {locale === "sq" ? "Portali B2B" : "B2B Portal"}
            </p>
            <h2 className="mb-4 text-4xl font-extrabold leading-tight text-white">
              {locale === "sq" ? (
                <>Gjithçka IT,<br /><span className="text-primary">një vend i vetëm.</span></>
              ) : (
                <>Everything IT,<br /><span className="text-primary">one single place.</span></>
              )}
            </h2>
            <p className="text-base leading-relaxed text-slate-400">
              {locale === "sq"
                ? "Menaxhoni mbështetjen teknike, porositë dhe ofertat tuaja nga platforma e unifikuar IT Arena."
                : "Manage your technical support, orders and quotes from the unified IT Arena platform."}
            </p>
          </div>

          <div className="space-y-4">
            {features.map((f) => (
              <div key={f.en} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white">
                  <f.icon className="h-4 w-4" />
                </div>
                <span className="text-sm text-slate-300">
                  {locale === "sq" ? f.sq : f.en}
                </span>
              </div>
            ))}
          </div>

          {/* testimonial */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <p className="mb-3 text-sm leading-relaxed text-slate-300 italic">
              {locale === "sq"
                ? "\"IT Arena reduktoi kohën e zgjidhjes së problemeve tona IT me 70%. Portali është shumë i thjeshtë dhe efikas.\""
                : "\"IT Arena reduced our IT problem resolution time by 70%. The portal is very intuitive and efficient.\""}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                DK
              </div>
              <p className="text-[11px] text-slate-500">IT Manager</p>
            </div>
          </div>
        </div>

        {/* trust footer */}
        <div className="relative z-10 flex items-center gap-2 border-t border-white/10 pt-6">
          <Shield className="h-4 w-4 text-slate-500 shrink-0" />
          <span className="text-xs text-slate-500">ISO 27001 Secured · SSL Encrypted · GDPR Compliant</span>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────── */}
      <div className="flex min-h-screen flex-col bg-white">
        {/* mobile logo */}
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4 lg:hidden">
          <ItArenaLogo variant="light" size="sm" />
          <Link
            href={locale === "sq" ? "/regjistrohu" : "/en/regjistrohu"}
            className="text-xs font-semibold text-primary hover:underline"
          >
            {locale === "sq" ? "Regjistrohu falas →" : "Register free →"}
          </Link>
        </div>

        {/* centered form */}
        <div className="flex flex-1 items-center justify-center px-6 py-16">
          <div className="w-full max-w-[400px]">
            <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-slate-100" />}>
              <LoginForm />
            </Suspense>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {locale === "sq" ? "Nuk keni llogari?" : "Don't have an account?"}{" "}
              <Link
                href={locale === "sq" ? "/regjistrohu" : "/en/regjistrohu"}
                className="font-semibold text-primary hover:underline"
              >
                {locale === "sq" ? "Regjistrohu falas" : "Register for free"}
              </Link>
            </p>

            <div className="mt-8 flex items-center justify-center gap-1 text-xs text-muted-foreground/60">
              <Shield className="h-3 w-3" />
              <span>SSL · ISO 27001</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
