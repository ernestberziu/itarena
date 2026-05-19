"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLucideIcon } from "@/lib/site-content/icons";
import { pickLocale } from "@/lib/site-content/locale";
import { resolveMarketingHref } from "@/lib/shop-url";
import type { SiteHeroSettings } from "@/lib/site-content/types";

const heroCtaBase =
  "group relative inline-flex w-full cursor-pointer select-none items-center justify-center gap-3 overflow-hidden font-extrabold tracking-tight transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-safe:active:scale-[0.98] sm:w-auto";

function HeroPrimaryCta({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        heroCtaBase,
        "min-h-[3.75rem] rounded-full px-8 py-4 text-base text-white shadow-[0_8px_32px_-4px_hsl(var(--primary)/0.7),0_0_0_1px_hsl(var(--primary)/0.4)] focus-visible:ring-primary md:min-h-[4.25rem] md:px-10 md:text-lg",
        "bg-[linear-gradient(135deg,hsl(var(--primary))_0%,#2563eb_45%,#7c3aed_100%)]",
        "motion-safe:hover:scale-[1.04] motion-safe:hover:shadow-[0_12px_40px_-4px_hsl(var(--primary)/0.8),0_0_0_2px_rgba(255,255,255,0.25)_inset]",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(105deg,transparent_35%,rgba(255,255,255,0.22)_50%,transparent_65%)] before:opacity-0 before:transition-opacity motion-safe:hover:before:opacity-100"
      )}
    >
      <span className="relative z-10 flex items-center gap-3">
        {children}
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 md:h-10 md:w-10">
          <ArrowRight className="h-5 w-5" strokeWidth={2.5} aria-hidden />
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
        "min-h-[3.75rem] rounded-full px-2 py-2 pr-7 text-base text-white focus-visible:ring-amber-400 md:min-h-[4.25rem] md:pr-8 md:text-lg",
        "bg-[#0b1120] shadow-[0_8px_30px_-6px_rgba(0,0,0,0.45),0_0_0_1px_rgba(251,191,36,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]",
        "ring-2 ring-amber-400/70 ring-offset-2 ring-offset-transparent",
        "motion-safe:hover:scale-[1.04] motion-safe:hover:ring-amber-300/90 motion-safe:hover:shadow-[0_12px_40px_-6px_rgba(251,191,36,0.35),0_0_0_1px_rgba(251,191,36,0.5)]",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:bg-[radial-gradient(circle_at_20%_50%,rgba(251,191,36,0.14),transparent_55%)]"
      )}
    >
      <span className="relative z-10 flex items-center gap-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(145deg,#fcd34d,#f59e0b)] text-[#1a1207] shadow-[0_4px_14px_-2px_rgba(245,158,11,0.55)] md:h-12 md:w-12">
          <ShoppingBag className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2.25} aria-hidden />
        </span>
        <span className="flex flex-col items-start gap-0.5 text-left leading-none">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400/90 md:text-[11px]">
            IT Shop
          </span>
          <span>{children}</span>
        </span>
        <ArrowRight
          className="ml-1 h-5 w-5 shrink-0 text-amber-400/80 motion-safe:transition-transform motion-safe:group-hover:translate-x-1 md:h-5 md:w-5"
          strokeWidth={2.25}
          aria-hidden
        />
      </span>
    </Link>
  );
}

function HeroTertiaryCta({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex w-full cursor-pointer select-none rounded-full p-[2px] transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 motion-safe:active:scale-[0.98] sm:w-auto",
        "bg-[linear-gradient(135deg,hsl(var(--primary)/0.55)_0%,#3b82f6_50%,#8b5cf6_100%)]",
        "shadow-[0_4px_24px_-8px_rgba(99,102,241,0.35)]",
        "motion-safe:hover:scale-[1.03] motion-safe:hover:shadow-[0_8px_32px_-8px_rgba(99,102,241,0.45)]",
        "motion-safe:hover:bg-[linear-gradient(135deg,hsl(var(--primary))_0%,#2563eb_50%,#7c3aed_100%)]"
      )}
    >
      <span
        className={cn(
          "relative flex min-h-[3.5rem] w-full items-center justify-center gap-3 overflow-hidden rounded-full px-7 py-3.5 md:min-h-[4rem] md:px-9",
          "bg-white/88 text-base font-bold text-slate-800 backdrop-blur-xl md:text-lg",
          "motion-safe:transition-[background-color,color,box-shadow] motion-safe:group-hover:bg-white motion-safe:group-hover:text-slate-900",
          "before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_0%_50%,rgba(99,102,241,0.07),transparent_60%)] before:opacity-0 before:transition-opacity motion-safe:group-hover:before:opacity-100"
        )}
      >
        <span className="relative z-10">{children}</span>
        <span className="relative z-10 flex items-center text-primary/80 motion-safe:transition-all motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:text-violet-600">
          <ArrowRight className="h-5 w-5" strokeWidth={2.25} aria-hidden />
        </span>
      </span>
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
        "relative overflow-hidden pb-20 pt-16 md:pb-28 md:pt-24 lg:pb-32 lg:pt-28",
        hero.gradientClass || "mesh-gradient"
      )}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[20%] top-[10%] h-[520px] w-[520px] rounded-full bg-primary/15 blur-[100px]" />
        <div className="absolute -right-[15%] bottom-0 h-[480px] w-[480px] rounded-full bg-violet-500/12 blur-[90px]" />
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-amber-400/10 blur-[80px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,rgba(255,255,255,0.45),transparent_55%)]" />
      </div>

      <div className="container relative mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border-2 border-primary/25 bg-white/80 px-6 py-2.5 text-sm font-bold text-primary shadow-lg shadow-primary/10 backdrop-blur-sm md:text-base">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
            <span>{pl(hero.badge)}</span>
          </div>

          <h1 className="mx-auto mb-8 max-w-5xl text-[2.35rem] font-black leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl xl:text-[4.5rem] xl:leading-[1.02]">
            {pl(hero.titleLine1)}{" "}
            <span className="bg-gradient-to-r from-primary via-blue-600 to-violet-600 bg-clip-text text-transparent">
              {pl(hero.titleHighlight)}
            </span>{" "}
            {pl(hero.titleLine2)}
          </h1>

          <p className="mx-auto mb-12 max-w-3xl text-lg font-medium leading-relaxed text-muted-foreground md:text-xl lg:text-2xl lg:leading-relaxed">
            {pl(hero.subtitle)}
          </p>

          <div className="mx-auto flex max-w-3xl flex-col items-stretch gap-4 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-5">
            <HeroPrimaryCta href={`${lp}${hero.ctaPrimaryLink}`}>
              {pl(hero.ctaPrimaryText)}
            </HeroPrimaryCta>
            <HeroShopCta href={resolveMarketingHref(hero.ctaSecondaryLink, lp)}>
              {pl(hero.ctaSecondaryText)}
            </HeroShopCta>
            <HeroTertiaryCta href={`${lp}${hero.ctaTertiaryLink}`}>
              {pl(hero.ctaTertiaryText)}
            </HeroTertiaryCta>
          </div>

          <div className="mx-auto mt-10 grid w-full max-w-[18rem] grid-cols-2 overflow-hidden rounded-xl border border-border/45 bg-white/70 shadow-sm backdrop-blur-md sm:inline-flex sm:w-auto sm:max-w-none sm:divide-x sm:divide-border/45 sm:rounded-full sm:bg-white/65 sm:px-0.5 sm:py-0.5">
            {hero.quickStats.map((s, index) => {
              const Icon = getLucideIcon(s.iconKey);
              const accents = [
                "text-blue-600",
                "text-amber-600",
                "text-emerald-600",
                "text-violet-600",
              ];
              const accent = accents[index % accents.length];
              return (
                <div
                  key={s.value}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 px-4 py-2.5 sm:min-w-[5.25rem] sm:px-4 sm:py-2 md:min-w-[6rem]",
                    index % 2 === 0 && "border-r border-border/45 sm:border-r-0",
                    index < 2 && "border-b border-border/45 sm:border-b-0"
                  )}
                >
                  <span className="flex items-center gap-1">
                    <Icon className={cn("h-3 w-3 shrink-0 opacity-80", accent)} strokeWidth={2.25} aria-hidden />
                    <span className="text-sm font-extrabold tabular-nums leading-none tracking-tight text-foreground">
                      {s.value}
                    </span>
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {pl(s.label)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
