"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { pickLocale } from "@/lib/site-content/locale";
import { resolveMarketingHref } from "@/lib/shop-url";
import type { SiteHeroSettings } from "@/lib/site-content/types";
import { HomeHero3dBackground } from "@/components/public/home-hero-3d-background";

export const HOME_SERVICES_SECTION_ID = "home-services";

function isHomeServicesLink(link: string): boolean {
  const normalized = link.replace(/^#/, "").replace(/^\//, "");
  return (
    link === "#services" ||
    link === "#home-services" ||
    normalized === "services" ||
    normalized === "home-services" ||
    normalized === "sherbime"
  );
}

function scrollToHomeServices() {
  document.getElementById(HOME_SERVICES_SECTION_ID)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

const heroCtaBase =
  "group relative inline-flex w-full cursor-pointer select-none items-center justify-center gap-3 overflow-hidden font-extrabold tracking-tight transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-safe:active:scale-[0.98] sm:w-auto";

function HeroPrimaryCta({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        heroCtaBase,
        "min-h-[3.25rem] rounded-full px-6 py-3 text-sm text-white shadow-[0_8px_32px_-4px_hsl(var(--primary)/0.7),0_0_0_1px_hsl(var(--primary)/0.4)] focus-visible:ring-primary md:min-h-[3.5rem] md:px-8 md:text-base",
        "bg-[linear-gradient(135deg,hsl(var(--primary))_0%,#2563eb_45%,#7c3aed_100%)]",
        "motion-safe:hover:scale-[1.04] motion-safe:hover:shadow-[0_12px_40px_-4px_hsl(var(--primary)/0.8),0_0_0_2px_rgba(255,255,255,0.25)_inset]",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(105deg,transparent_35%,rgba(255,255,255,0.22)_50%,transparent_65%)] before:opacity-0 before:transition-opacity motion-safe:hover:before:opacity-100"
      )}
    >
      <span className="relative z-10 flex items-center gap-3">
        {children}
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 md:h-9 md:w-9">
          <ArrowRight className="h-4 w-4 md:h-5 md:w-5" strokeWidth={2.5} aria-hidden />
        </span>
      </span>
    </Link>
  );
}

function HeroShopCta({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        heroCtaBase,
        "min-h-[3.25rem] rounded-full px-4 py-2 text-sm text-white focus-visible:ring-amber-400 sm:px-2 sm:pr-6 md:min-h-[3.5rem] md:pr-7 md:text-base",
        "bg-[#0b1120] shadow-[0_8px_30px_-6px_rgba(0,0,0,0.45),0_0_0_1px_rgba(251,191,36,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]",
        "ring-2 ring-amber-400/70 ring-offset-2 ring-offset-transparent",
        "motion-safe:hover:scale-[1.04] motion-safe:hover:ring-amber-300/90 motion-safe:hover:shadow-[0_12px_40px_-6px_rgba(251,191,36,0.35),0_0_0_1px_rgba(251,191,36,0.5)]",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:bg-[radial-gradient(circle_at_20%_50%,rgba(251,191,36,0.14),transparent_55%)]"
      )}
    >
      <span className="relative z-10 flex items-center gap-2.5 sm:gap-3.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(145deg,#fcd34d,#f59e0b)] text-[#1a1207] shadow-[0_4px_14px_-2px_rgba(245,158,11,0.55)] sm:h-9 sm:w-9 md:h-10 md:w-10">
          <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" strokeWidth={2.25} aria-hidden />
        </span>
        <span className="sm:hidden">{children}</span>
        <span className="hidden flex-col items-start gap-0.5 text-left leading-none sm:flex">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400/90 md:text-[11px]">
            IT Shop
          </span>
          <span>{children}</span>
        </span>
        <ArrowRight
          className="ml-auto h-4 w-4 shrink-0 text-amber-400/80 motion-safe:transition-transform motion-safe:group-hover:translate-x-1 sm:ml-1 sm:h-5 sm:w-5"
          strokeWidth={2.25}
          aria-hidden
        />
      </span>
    </Link>
  );
}

function HeroTertiaryCta({
  href,
  onClick,
  children,
}: {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  const outerClassName = cn(
    "group relative inline-flex w-full cursor-pointer select-none rounded-full p-[2px] transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 motion-safe:active:scale-[0.98] sm:w-auto",
    "bg-[linear-gradient(135deg,hsl(var(--primary)/0.55)_0%,#3b82f6_50%,#8b5cf6_100%)]",
    "shadow-[0_4px_24px_-8px_rgba(99,102,241,0.35)]",
    "motion-safe:hover:scale-[1.03] motion-safe:hover:shadow-[0_8px_32px_-8px_rgba(99,102,241,0.45)]",
    "motion-safe:hover:bg-[linear-gradient(135deg,hsl(var(--primary))_0%,#2563eb_50%,#7c3aed_100%)]"
  );

  const inner = (
    <span
      className={cn(
        "relative flex min-h-[3rem] w-full items-center justify-center gap-2.5 overflow-hidden rounded-full px-6 py-3 md:min-h-[3.25rem] md:px-8",
        "bg-white/88 text-sm font-bold text-slate-800 backdrop-blur-xl md:text-base",
        "motion-safe:transition-[background-color,color,box-shadow] motion-safe:group-hover:bg-white motion-safe:group-hover:text-slate-900",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_0%_50%,rgba(99,102,241,0.07),transparent_60%)] before:opacity-0 before:transition-opacity motion-safe:group-hover:before:opacity-100"
      )}
    >
      <span className="relative z-10">{children}</span>
      <span className="relative z-10 flex items-center text-primary/80 motion-safe:transition-all motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:text-violet-600">
        <ArrowRight className="h-5 w-5" strokeWidth={2.25} aria-hidden />
      </span>
    </span>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={outerClassName}>
        {inner}
      </button>
    );
  }

  return (
    <Link href={href!} className={outerClassName}>
      {inner}
    </Link>
  );
}

export function HomeHeroSection({
  hero,
  locale,
  lp,
}: {
  hero: SiteHeroSettings;
  locale: string;
  lp: string;
}) {
  const pl = (f: { sq: string; en: string }) => pickLocale(f, locale);

  return (
    <section
      className={cn(
        "relative isolate flex min-h-[calc(100dvh-3.5rem)] flex-col overflow-hidden bg-[#fafbff] md:min-h-[calc(100dvh-4rem)]",
        "py-6 md:py-8"
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_20%,#eef2ff_0%,transparent_55%)] md:bg-[radial-gradient(ellipse_100%_70%_at_50%_40%,#eef2ff_0%,transparent_60%)]" />

      <div className="pointer-events-none absolute inset-0">
        <HomeHero3dBackground locale={locale} />
      </div>

      <div className="container relative z-10 mx-auto flex flex-1 flex-col items-center justify-center px-4">
        <div className="relative w-full max-w-lg text-center md:max-w-2xl">
          <h1 className="mx-auto mb-3 max-w-4xl text-[2rem] font-black leading-[1.1] tracking-tight text-foreground sm:mb-5 sm:text-4xl md:text-5xl lg:text-6xl">
            {pl(hero.titleLine1)}{" "}
            <span className="bg-gradient-to-r from-primary via-blue-600 to-violet-600 bg-clip-text text-transparent">
              {pl(hero.titleHighlight)}
            </span>{" "}
            {pl(hero.titleLine2)}
          </h1>

          <p className="mx-auto mb-6 max-w-2xl text-[0.9375rem] font-medium leading-relaxed text-muted-foreground sm:mb-6 sm:text-base md:text-lg lg:text-xl">
            {pl(hero.subtitle)}
          </p>

          <div className="mx-auto flex max-w-3xl flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
            <HeroPrimaryCta href={`${lp}${hero.ctaPrimaryLink}`}>
              {pl(hero.ctaPrimaryText)}
            </HeroPrimaryCta>
            <HeroShopCta href={resolveMarketingHref(hero.ctaSecondaryLink, lp)}>
              {pl(hero.ctaSecondaryText)}
            </HeroShopCta>
            {isHomeServicesLink(hero.ctaTertiaryLink) ? (
              <HeroTertiaryCta onClick={scrollToHomeServices}>
                {pl(hero.ctaTertiaryText)}
              </HeroTertiaryCta>
            ) : (
              <HeroTertiaryCta href={`${lp}${hero.ctaTertiaryLink}`}>
                {pl(hero.ctaTertiaryText)}
              </HeroTertiaryCta>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
