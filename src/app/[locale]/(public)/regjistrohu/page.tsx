import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { RegisterForm } from "@/components/auth/register-form";
import { Shield, User, Building2, CheckCircle2 } from "lucide-react";
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
    page: "register",
    robots: { index: false, follow: false },
  });
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const accountTypes = [
    {
      icon: User,
      color: "bg-blue-500/15 text-blue-400",
      titleSq: "Llogari Individuale",
      titleEn: "Individual Account",
      descSq: "Për profesionistë dhe përdorues individualë që duan akses në biletat dhe porositë.",
      descEn: "For professionals and individual users who want access to tickets and orders.",
    },
    {
      icon: Building2,
      color: "bg-amber-500/15 text-amber-400",
      titleSq: "Llogari Biznesi B2B",
      titleEn: "B2B Business Account",
      descSq: "Çmime ekskluzive, oferta sasi, fatura dhe menaxhim i plotë i kontratave.",
      descEn: "Exclusive prices, volume quotes, invoices and full contract management.",
    },
    {
      icon: CheckCircle2,
      color: "bg-emerald-500/15 text-emerald-400",
      titleSq: "Akses i Menjëhershëm",
      titleEn: "Instant Access",
      descSq: "Portali aktivizohet menjëherë. Llogaria B2B verifikohet brenda 24 orësh.",
      descEn: "Portal activates immediately. B2B account verified within 24 hours.",
    },
  ];

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.4fr]">
      {/* ── Left brand panel ─────────────────────────────── */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[hsl(222,47%,8%)] px-14 py-12">
        {/* glow orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-primary/28 blur-[130px]" />
          <div className="absolute bottom-0 -left-20 h-[400px] w-[400px] rounded-full bg-amber-500/15 blur-[110px]" />
        </div>

        {/* logo */}
        <div className="relative z-10">
          <ItArenaLogo variant="dark" size="md" showTagline />
        </div>

        {/* copy */}
        <div className="relative z-10 space-y-8">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary/80">
              {locale === "sq" ? "Regjistrim Falas" : "Free Registration"}
            </p>
            <h2 className="mb-4 text-4xl font-extrabold leading-tight text-white">
              {locale === "sq" ? (
                <>Bashkohuni me<br /><span className="text-primary">500+ biznese</span><br />shqiptare.</>
              ) : (
                <>Join <span className="text-primary">500+ Albanian</span><br />businesses.</>
              )}
            </h2>
            <p className="text-base leading-relaxed text-slate-400">
              {locale === "sq"
                ? "Krijoni llogarinë tuaj falas dhe fitoni akses të plotë në platformën IT Arena — biletat, porositë dhe ofertat B2B."
                : "Create your free account and gain full access to the IT Arena platform — tickets, orders and B2B quotes."}
            </p>
          </div>

          {/* account type cards */}
          <div className="space-y-3">
            {accountTypes.map((a) => (
              <div
                key={a.titleEn}
                className="flex items-start gap-4 rounded-xl border border-white/8 bg-white/5 p-4 backdrop-blur-sm"
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${a.color}`}>
                  <a.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {locale === "sq" ? a.titleSq : a.titleEn}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                    {locale === "sq" ? a.descSq : a.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* trust footer */}
        <div className="relative z-10 flex items-center gap-2 border-t border-white/10 pt-6">
          <Shield className="h-4 w-4 shrink-0 text-slate-500" />
          <span className="text-xs text-slate-500">
            {locale === "sq"
              ? "Të dhënat tuaja janë të sigurta · ISO 27001 · SSL"
              : "Your data is safe · ISO 27001 · SSL Encrypted"}
          </span>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────── */}
      <div className="flex min-h-screen flex-col bg-slate-50">
        {/* mobile logo */}
        <div className="flex items-center justify-between border-b border-border/60 bg-white px-6 py-4 lg:hidden">
          <ItArenaLogo variant="light" size="sm" />
          <Link
            href={locale === "sq" ? "/hyr" : "/en/hyr"}
            className="text-xs font-semibold text-primary hover:underline"
          >
            {locale === "sq" ? "Kam llogari →" : "I have an account →"}
          </Link>
        </div>

        {/* form area */}
        <div className="flex flex-1 items-start justify-center px-6 py-10">
          <div className="w-full max-w-[560px]">
            {/* page heading */}
            <div className="mb-8">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                {locale === "sq" ? "Krijoni Llogarinë Tuaj" : "Create Your Account"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {locale === "sq"
                  ? "Regjistrohu si individual ose si biznes B2B."
                  : "Register as an individual or a B2B business."}
              </p>
            </div>

            {/* form card */}
            <div className="rounded-2xl border border-border/60 bg-white p-8 shadow-sm">
              <RegisterForm />
              <p className="mt-6 text-center text-sm text-muted-foreground">
                {locale === "sq" ? "Keni llogari?" : "Already have an account?"}{" "}
                <Link
                  href={locale === "sq" ? "/hyr" : "/en/hyr"}
                  className="font-semibold text-primary hover:underline"
                >
                  {locale === "sq" ? "Hyni këtu" : "Login here"}
                </Link>
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground/60">
              {locale === "sq"
                ? "Duke u regjistruar, pranoni Kushtet e Shërbimit dhe Politikën e Privatësisë."
                : "By registering, you accept our Terms of Service and Privacy Policy."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
