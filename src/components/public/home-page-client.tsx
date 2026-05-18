"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import type { PublishedSiteContent } from "@/lib/site-content/types";
import { getLucideIcon } from "@/lib/site-content/icons";
import { pickLocale, serviceName, serviceShortDesc } from "@/lib/site-content/locale";
import {
  Monitor, Cloud, Globe, Camera, Wifi, Code2,
  Network, Printer, ArrowRight, CheckCircle2,
  Phone, Zap, Users, Trophy, Clock, Star, ShoppingBag,
  TrendingUp, Lock, HeadphonesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { shopUrl } from "@/lib/shop-url";

const serviceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  it_support: Monitor,
  cloud: Cloud,
  web: Globe,
  cctv: Camera,
  telecom: Wifi,
  software: Code2,
  network: Network,
  printers: Printer,
};

const serviceColors: Record<string, { bg: string; text: string; border: string }> = {
  it_support:    { bg: "bg-blue-50",    text: "text-blue-600",    border: "border-blue-100" },
  cloud:         { bg: "bg-sky-50",     text: "text-sky-600",     border: "border-sky-100" },
  telecom:       { bg: "bg-violet-50",  text: "text-violet-600",  border: "border-violet-100" },
  web:           { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
  cctv:          { bg: "bg-rose-50",    text: "text-rose-600",    border: "border-rose-100" },
  network:       { bg: "bg-orange-50",  text: "text-orange-600",  border: "border-orange-100" },
  software:      { bg: "bg-indigo-50",  text: "text-indigo-600",  border: "border-indigo-100" },
  printers:      { bg: "bg-teal-50",    text: "text-teal-600",    border: "border-teal-100" },
};

const serviceAccent: Record<string, string> = {
  it_support:    "bg-blue-500",
  cloud:         "bg-sky-500",
  telecom:       "bg-violet-500",
  web:           "bg-emerald-500",
  cctv:          "bg-rose-500",
  network:       "bg-orange-500",
  software:      "bg-indigo-500",
  printers:      "bg-teal-500",
};

const serviceKeys = [
  "it_support", "cloud", "telecom", "web", "cctv",
  "network", "software", "printers",
];

const serviceHrefs: Record<string, string> = {
  it_support: "/sherbime/it-support",
  cloud: "/sherbime/cloud",
  telecom: "/sherbime/telekomunikacion",
  web: "/sherbime/web-marketing",
  cctv: "/sherbime/cctv-siguri",
  network: "/sherbime/rrjet",
  software: "/sherbime/software",
  printers: "/sherbime/printere",
};

const industries = [
  { name: "Kontabilitet", icon: "💼" },
  { name: "Ndërtim", icon: "🏗️" },
  { name: "Arsim", icon: "🎓" },
  { name: "Inxhinieri", icon: "⚙️" },
  { name: "Imobiliare", icon: "🏠" },
  { name: "Prodhim", icon: "🏭" },
  { name: "Shëndetësi", icon: "🏥" },
  { name: "Hotele", icon: "🏨" },
  { name: "Zyra", icon: "🏢" },
  { name: "Restorante", icon: "🍽️" },
  { name: "Juridik", icon: "⚖️" },
  { name: "Shitje me Pakicë", icon: "🛍️" },
];

const testimonials = [
  {
    initials: "AH",
    role: "CEO",
    text: "IT Arena transformoi infrastrukturën tonë IT brenda 30 ditëve. Downtime zero, produktivitet i lartë. Rekomandoj me besim.",
    rating: 5,
    color: "bg-blue-500",
  },
  {
    initials: "EK",
    role: "CFO",
    text: "Zgjidhja cloud dhe Microsoft 365 e implementuar nga IT Arena ul kostot tona operacionale me 40%. Ekip profesional dhe i dedikuar.",
    rating: 5,
    color: "bg-emerald-500",
  },
  {
    initials: "BR",
    role: "IT Manager",
    text: "Kamera CCTV dhe sistemi i kontrollit të hyrjes punon pa defekt 24/7. Mbështetja e tyre është me të vërtetë 24 orë.",
    rating: 5,
    color: "bg-violet-500",
  },
];

export function HomePageClient({ content }: { content: PublishedSiteContent }) {
  const t = useTranslations();
  const locale = useLocale();
  const lp = locale === "sq" ? "" : `/${locale}`;
  const hero = content.settings.hero;
  const pl = (f: { sq: string; en: string }) => pickLocale(f, locale);

  return (
    <div className="flex flex-col">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className={cn("relative overflow-hidden py-24 md:py-36", hero.gradientClass || "mesh-gradient")}>
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-amber-400/8 blur-3xl" />
        </div>

        <div className="container relative mx-auto px-4 text-center">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-medium text-primary mb-8 shadow-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{pl(hero.badge)}</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-7 max-w-5xl mx-auto leading-[1.08]">
            {pl(hero.titleLine1)}{" "}
            <span className="bg-gradient-to-r from-primary via-blue-500 to-violet-600 bg-clip-text text-transparent">
              {pl(hero.titleHighlight)}
            </span>{" "}
            {pl(hero.titleLine2)}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            {pl(hero.subtitle)}
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center mb-12">
            <Button asChild>
              <Link href={`${lp}${hero.ctaPrimaryLink}`}>
                {pl(hero.ctaPrimaryText)}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="accent" asChild>
              <Link href={hero.ctaSecondaryLink.startsWith("http") ? hero.ctaSecondaryLink : `${lp}${hero.ctaSecondaryLink}`}>
                <ShoppingBag className="h-5 w-5" />
                {pl(hero.ctaSecondaryText)}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`${lp}${hero.ctaTertiaryLink}`}>
                {pl(hero.ctaTertiaryText)}
              </Link>
            </Button>
          </div>

          {/* Quick stats row */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            {hero.quickStats.map((s) => {
              const Icon = getLucideIcon(s.iconKey);
              return (
                <div key={s.value} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <strong className="text-foreground font-bold">{s.value}</strong>
                  <span>{pl(s.label)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Stats Banner ──────────────────────────────────── */}
      <section className="border-y border-border/50 bg-gradient-to-b from-slate-50/90 to-white">
        <div className="container mx-auto max-w-6xl px-4 py-10 md:py-14">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {hero.bannerStats.map((stat, idx) => {
              const statColors = [
                { color: "text-blue-600", bg: "bg-blue-50" },
                { color: "text-amber-600", bg: "bg-amber-50" },
                { color: "text-emerald-600", bg: "bg-emerald-50" },
                { color: "text-violet-600", bg: "bg-violet-50" },
              ];
              const palette = statColors[idx % statColors.length];
              const Icon = getLucideIcon(stat.iconKey);
              return (
              <div
                key={stat.value}
                className="flex min-h-[9.5rem] flex-col items-center justify-center gap-3 rounded-2xl border border-border/50 bg-white px-3 py-5 text-center shadow-sm sm:min-h-[10rem] sm:px-4 sm:py-6"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${palette.bg}`}
                  aria-hidden
                >
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${palette.color}`} strokeWidth={2} />
                </div>
                <div className="flex w-full min-w-0 flex-col items-center gap-1">
                  <div className="text-2xl font-extrabold tabular-nums tracking-tight text-foreground sm:text-3xl md:text-4xl">
                    {stat.value}
                  </div>
                  <p className="max-w-[11.5rem] text-[11px] font-medium leading-snug text-muted-foreground sm:max-w-[13rem] sm:text-xs md:text-sm">
                    {pl(stat.label)}
                  </p>
                </div>
              </div>
            );})}
          </div>
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-4">
              {locale === "sq" ? "Çfarë Ofrojmë" : "What We Offer"}
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-5 tracking-tight">
              {locale === "sq" ? "8 Divizione Shërbimi" : "8 Service Divisions"}
            </h2>
            <p className="text-lg text-muted-foreground">
              {locale === "sq"
                ? "Nga mbështetja ditore deri te projektet e mëdha, kemi gjithçka që biznesi juaj ka nevojë."
                : "From daily support to large-scale projects, we have everything your business needs."}
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {content.services.filter((s) => s.showOnHomepage).map((svc) => {
              const Icon = getLucideIcon(svc.iconKey);
              const col = { bg: svc.colorClass?.split(" ")[0] ?? "bg-muted", border: svc.colorClass?.split(" ")[2] ?? "border-border", text: svc.colorClass?.split(" ")[1] ?? "text-foreground" };
              const accent = svc.accentClass ? `bg-gradient-to-r ${svc.accentClass}` : "bg-primary";
              return (
                <Link key={svc.id} href={`${lp}/sherbime/${svc.slug}`} className="group flex h-full min-h-0">
                  <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60">
                    {/* Color accent top bar */}
                    <div className={`h-1 w-full shrink-0 ${accent}`} />
                    <div className="flex flex-1 flex-col p-5">
                      <div className={`mb-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${col.bg} ${col.border}`}>
                        <Icon className={`h-5 w-5 ${col.text}`} />
                      </div>
                      <h3 className="mb-1.5 line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug">
                        {serviceName(svc, locale)}
                      </h3>
                      <p className="flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                        {serviceShortDesc(svc, locale)}
                      </p>
                      <div className="mt-4 flex shrink-0 items-center gap-1 text-xs font-semibold text-primary opacity-70 transition-opacity group-hover:opacity-100">
                        {locale === "sq" ? "Mëso më shumë" : "Learn more"} <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Button variant="outline" size="lg" asChild>
              <Link href={`${lp}/sherbime`}>
                {locale === "sq" ? "Shiko Të Gjitha Shërbimet" : "View All Services"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Why Us ────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-y border-white/5 bg-[hsl(222,47%,9%)] py-28 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 right-0 h-[520px] w-[520px] rounded-full bg-primary/20 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-[380px] w-[380px] rounded-full bg-amber-500/12 blur-[90px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(255,255,255,0.06),transparent)]" />
        </div>

        <div className="container relative mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-2 lg:gap-20">
            {/* Copy + pillars */}
            <div className="lg:pt-2">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/95 shadow-lg shadow-amber-900/20 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]" aria-hidden />
                {locale === "sq" ? "Pse IT Arena" : "Why IT Arena"}
              </span>

              <h2 className="mb-6 text-3xl font-extrabold leading-[1.12] tracking-tight md:text-4xl lg:text-[2.65rem] lg:leading-[1.1]">
                {locale === "sq" ? (
                  <>
                    Partnerë,{" "}
                    <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                      jo thjesht
                    </span>{" "}
                    ofrues shërbimi
                  </>
                ) : (
                  <>
                    Partners,{" "}
                    <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                      not just
                    </span>{" "}
                    a service provider
                  </>
                )}
              </h2>

              <p className="mb-12 max-w-xl text-lg leading-relaxed text-slate-300 md:text-[1.05rem]">
                {locale === "sq"
                  ? "Ndërtojmë marrëdhënie afatgjata. Kuptojmë biznesin tuaj, hartojmë rrugëmapin teknologjik dhe garantojmë rezultate të matshme — jo premtime bosh."
                  : "We build long-term relationships. We understand your business, map the technology roadmap and guarantee measurable results — not empty promises."}
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3.5">
                {[
                  {
                    icon: Zap,
                    key: "response",
                    title: locale === "sq" ? "Reagim i Menjëhershëm" : "Instant Response",
                    desc: locale === "sq" ? "SLA të garantuara, jo premtime" : "Guaranteed SLA, not promises",
                    ring: "border-amber-400/25",
                    glow: "from-amber-400/35 to-amber-600/5",
                    iconClass: "text-amber-300",
                  },
                  {
                    icon: Lock,
                    key: "security",
                    title: locale === "sq" ? "Siguri ISO 27001" : "ISO 27001 Security",
                    desc: locale === "sq" ? "Standardet më të larta të sigurisë" : "Highest security standards",
                    ring: "border-emerald-400/25",
                    glow: "from-emerald-400/30 to-emerald-700/5",
                    iconClass: "text-emerald-300",
                  },
                  {
                    icon: TrendingUp,
                    key: "scale",
                    title: locale === "sq" ? "Rritje me Ju" : "Grow With You",
                    desc: locale === "sq" ? "Zgjidhje që shkallëzohen" : "Solutions that scale",
                    ring: "border-sky-400/25",
                    glow: "from-sky-400/30 to-blue-700/5",
                    iconClass: "text-sky-300",
                  },
                  {
                    icon: HeadphonesIcon,
                    key: "support",
                    title: "24/7 Support",
                    desc: locale === "sq" ? "Gjithmonë të arritshëm" : "Always reachable",
                    ring: "border-violet-400/25",
                    glow: "from-violet-400/30 to-violet-800/5",
                    iconClass: "text-violet-200",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className={cn(
                      "group relative flex gap-4 rounded-2xl border bg-white/[0.06] p-5 shadow-xl shadow-black/25 backdrop-blur-md transition-[transform,box-shadow,background-color,border-color] duration-300 ease-out motion-reduce:transition-none",
                      "border-white/10 hover:border-white/18 hover:bg-white/[0.09] motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-2xl motion-safe:hover:shadow-black/30",
                      item.ring
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br shadow-inner",
                        item.ring,
                        item.glow
                      )}
                    >
                      <item.icon className={cn("h-5 w-5", item.iconClass)} strokeWidth={2} aria-hidden />
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p className="font-bold leading-snug text-white">{item.title}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-400 group-hover:text-slate-300/95 transition-colors duration-300">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats — framed panel */}
            <div className="relative lg:sticky lg:top-28">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-px rounded-[1.35rem] bg-gradient-to-br from-white/12 via-primary/20 to-amber-500/15 opacity-70 blur-sm"
              />
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[hsl(222_47%_11%/0.92)] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8">
                <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  {locale === "sq" ? "Në shifra" : "By the numbers"}
                </p>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {[
                    {
                      value: "500+",
                      label: locale === "sq" ? "Klientë Aktivë" : "Active Clients",
                      gradient: "from-blue-500/25 via-blue-600/10 to-slate-900/80",
                      bar: "bg-blue-400",
                    },
                    {
                      value: "98%",
                      label: locale === "sq" ? "Kënaqësi Klientësh" : "Client Satisfaction",
                      gradient: "from-emerald-500/25 via-emerald-600/10 to-slate-900/80",
                      bar: "bg-emerald-400",
                    },
                    {
                      value: "12+",
                      label: locale === "sq" ? "Vite Eksperiencë" : "Years Experience",
                      gradient: "from-amber-500/25 via-amber-600/10 to-slate-900/80",
                      bar: "bg-amber-400",
                    },
                    {
                      value: "<2h",
                      label: locale === "sq" ? "Koha Mesatare Reagimi" : "Avg. Response Time",
                      gradient: "from-violet-500/25 via-violet-600/10 to-slate-900/80",
                      bar: "bg-violet-400",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.value}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br p-6 text-center transition-[transform,border-color] duration-300 ease-out motion-reduce:transition-none motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-white/20"
                    >
                      <div
                        className={cn(
                          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90 transition-opacity duration-300 group-hover:opacity-100",
                          stat.gradient
                        )}
                      />
                      <div className="relative">
                        <div className={cn("mx-auto mb-3 h-1 w-10 rounded-full opacity-90", stat.bar)} />
                        <div className="font-mono text-3xl font-extrabold tabular-nums tracking-tight text-white md:text-4xl">
                          {stat.value}
                        </div>
                        <div className="mt-2 text-xs font-semibold leading-snug text-slate-400 md:text-[13px]">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-4">
              {locale === "sq" ? "Çfarë Thonë Klientët" : "What Clients Say"}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold">
              {locale === "sq" ? "500+ Biznese na Besojnë" : "500+ Businesses Trust Us"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.testimonials.filter((t) => t.enabled).map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-white border border-border/60 p-7 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic">
                  &ldquo;{locale === "en" ? item.reviewEn : item.reviewSq}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${item.avatarColor ?? "bg-primary"} text-white font-bold text-sm tracking-tight`}
                    aria-hidden
                  >
                    {item.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm">{item.clientName}</p>
                    <p className="text-xs text-muted-foreground">{locale === "en" ? item.roleEn : item.roleSq}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Industries ────────────────────────────────────── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              {locale === "sq" ? "Industritë që Shërbejmë" : "Industries We Serve"}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {locale === "sq"
                ? "Zgjidhje IT të personalizuara për çdo sektor ekonomik."
                : "Tailored IT solutions for every economic sector."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {content.settings.landing.industries.map((ind) => (
              <span
                key={pl(ind.name)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-border bg-white text-sm font-medium hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all cursor-default shadow-sm"
              >
                <span>{ind.icon}</span>
                {pl(ind.name)}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Shop CTA ──────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="rounded-3xl border-2 border-amber-500 shadow-xl shadow-amber-200/40">
            <div className="rounded-[22px] bg-white px-8 py-10 md:px-12 md:py-14">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingBag className="h-6 w-6 text-amber-500" />
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-500">IT Shop</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
                    {locale === "sq"
                      ? "Bleni Hardware & Software Direkt Online"
                      : "Buy Hardware & Software Directly Online"}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {locale === "sq"
                      ? "Kompjuterë, serverë, rrjete dhe gjithçka tjetër — me dorëzim dhe pagesa me dorëzim (COD). Bizneset B2B marrin çmime ekskluzive dhe mund të kërkojnë ofertë sasi."
                      : "Computers, servers, networks and everything else — with delivery and cash on delivery. B2B businesses get exclusive prices and can request quantity quotes."}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
                  <Button asChild>
                    <Link href={shopUrl()}>
                      {locale === "sq" ? "Vizito Dyqanin" : "Visit Shop"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                  >
                    <Link href={`${lp}/kerko-oferte`}>
                      {locale === "sq" ? "Kërko Ofertë B2B" : "B2B Quote"}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-primary via-blue-700 to-violet-700 text-white relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -right-20 h-[400px] w-[400px] rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="container relative mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-5">
            {locale === "sq" ? "Gati të Filloni?" : "Ready to Get Started?"}
          </h2>
          <p className="text-white/75 text-lg mb-10 max-w-2xl mx-auto">
            {locale === "sq"
              ? "Merrni konsultimin tuaj falas sot. Ekipi ynë i ekspertëve është gati t'ju ndihmojë të zgjidhni rrugëmapin e duhur teknologjik."
              : "Get your free consultation today. Our team of experts is ready to help you choose the right technology roadmap."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="accent" asChild>
              <Link href={`${lp}/kontakt`}>
                {locale === "sq" ? "Na Kontaktoni Tani" : "Contact Us Now"}
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <a href="tel:+355696314319" className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                +355 69 63 14 319
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
