import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  HeadphonesIcon,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getLucideIcon } from "@/lib/site-content/icons";
import {
  serviceFeatures,
  serviceFullDesc,
  serviceName,
  serviceShortDesc,
} from "@/lib/site-content/locale";
import type { MarketingServiceRecord } from "@/lib/site-content/types";
import { HomeServiceCard } from "@/components/public/home-service-card";

type Props = {
  svc: MarketingServiceRecord;
  related: MarketingServiceRecord[];
  locale: string;
  lp: string;
};

export function ServiceDetailView({ svc, related, locale, lp }: Props) {
  const sq = locale === "sq";
  const Icon = getLucideIcon(svc.iconKey);
  const features = serviceFeatures(svc, locale);
  const fullDesc = serviceFullDesc(svc, locale);
  const paragraphs = fullDesc.split(/\n\n+/).filter(Boolean);
  const ctaLabel =
    (sq ? svc.ctaTextSq : svc.ctaTextEn) || (sq ? "Kërko ofertë" : "Get a quote");
  const ctaHref = svc.ctaLink?.startsWith("/") ? `${lp}${svc.ctaLink}` : `${lp}/kerko-oferte`;

  const steps = [
    {
      n: "01",
      title: sq ? "Konsultë & audit" : "Consultation & audit",
      desc: sq
        ? "Kuptojmë objektivat, infrastrukturën dhe prioritetet tuaja."
        : "We understand your goals, infrastructure, and priorities.",
    },
    {
      n: "02",
      title: sq ? "Ofertë & plan" : "Proposal & plan",
      desc: sq
        ? "Ofertë e qartë me SLA, afate dhe kosto transparente."
        : "Clear proposal with SLA, timelines, and transparent pricing.",
    },
    {
      n: "03",
      title: sq ? "Implementim & mbështetje" : "Delivery & support",
      desc: sq
        ? "Ekzekutim me ekip lokal dhe mbështetje të vazhdueshme."
        : "Execution with a local team and ongoing support.",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section
        className={cn(
          "relative overflow-hidden py-16 text-white md:py-24",
          "bg-gradient-to-br",
          svc.accentClass ?? "from-primary to-blue-700"
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_-10%,rgba(255,255,255,0.18),transparent)]" />
        <div className="container relative mx-auto max-w-6xl px-4">
          <Link
            href={`${lp}/sherbime`}
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/75 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {sq ? "Të gjitha shërbimet" : "All services"}
          </Link>

          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="mb-6 inline-flex rounded-2xl border border-white/25 bg-white/10 p-4 backdrop-blur-sm">
                <Icon className="h-10 w-10 md:h-12 md:w-12" strokeWidth={1.75} />
              </div>
              <h1 className="mb-4 text-4xl font-black tracking-tight md:text-5xl lg:text-[3.25rem]">
                {serviceName(svc, locale)}
              </h1>
              <p className="max-w-2xl text-lg text-white/90 md:text-xl">
                {serviceShortDesc(svc, locale)}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" variant="secondary" asChild className="rounded-xl">
                  <Link href={ctaHref}>
                    {ctaLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="rounded-xl border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  <Link href={`${lp}/kontakt`}>{sq ? "Na kontaktoni" : "Contact us"}</Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:max-w-sm lg:max-w-xs">
              {[
                { icon: Clock, label: sq ? "SLA 1–4h" : "1–4h SLA" },
                { icon: Shield, label: "ISO 27001" },
                { icon: HeadphonesIcon, label: "24/7" },
                { icon: Sparkles, label: sq ? "Ekip lokal" : "Local team" },
              ].map((badge) => (
                <div
                  key={badge.label}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-4 text-center backdrop-blur-sm"
                >
                  <badge.icon className="h-5 w-5 text-white/90" />
                  <span className="text-xs font-bold uppercase tracking-wide text-white/90">
                    {badge.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
            <div>
              <h2 className="mb-6 text-2xl font-extrabold md:text-3xl">
                {sq ? "Përmbledhje" : "Overview"}
              </h2>
              <div className="space-y-5 text-lg leading-relaxed text-muted-foreground">
                {paragraphs.map((p) => (
                  <p key={p.slice(0, 40)}>{p}</p>
                ))}
              </div>

              <h2 className="mb-6 mt-14 text-2xl font-extrabold">
                {sq ? "Çfarë përfshin" : "What's included"}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 rounded-xl border border-border/60 bg-slate-50/80 px-4 py-3.5"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="font-medium text-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <h2 className="mb-8 mt-14 text-2xl font-extrabold">
                {sq ? "Si punojmë" : "How we work"}
              </h2>
              <ol className="grid gap-4 md:grid-cols-3">
                {steps.map((step) => (
                  <li
                    key={step.n}
                    className="relative rounded-2xl border border-border/60 bg-white p-6 shadow-sm"
                  >
                    <span className="font-mono text-3xl font-black text-primary/20">{step.n}</span>
                    <h3 className="mt-2 font-bold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border-2 border-primary/15 bg-gradient-to-b from-primary/5 to-white p-6 shadow-lg shadow-primary/5">
                <h3 className="mb-2 text-lg font-extrabold">
                  {sq ? "Gati për të filluar?" : "Ready to get started?"}
                </h3>
                <p className="mb-6 text-sm text-muted-foreground">
                  {sq
                    ? "Merrni ofertë të personalizuar brenda 24 orëve pune."
                    : "Get a tailored quote within one business day."}
                </p>
                <Button className="w-full rounded-xl" asChild>
                  <Link href={ctaHref}>{ctaLabel}</Link>
                </Button>
                <Button variant="outline" className="mt-3 w-full rounded-xl" asChild>
                  <a href="tel:+355696314319">+355 69 63 14 319</a>
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-border/50 bg-slate-50 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-10 text-center text-2xl font-extrabold md:text-3xl">
              {sq ? "Shërbime të ngjashme" : "Related services"}
            </h2>
            <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((rel, index, arr) => (
                <HomeServiceCard
                  key={rel.id}
                  svc={rel}
                  locale={locale}
                  lp={lp}
                  index={index}
                  total={arr.length}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA band */}
      <section className="bg-[hsl(222,47%,9%)] py-16 text-white">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-4 text-2xl font-extrabold md:text-3xl">
            {sq ? "Partner strategjik, jo vetëm ofrues" : "A strategic partner, not just a vendor"}
          </h2>
          <p className="mb-8 text-slate-400">
            {sq
              ? "Mbi 500 biznese në Shqipëri besojnë IT Arena për infrastrukturë dhe mbështetje të përditshme."
              : "500+ businesses in Albania trust IT Arena for infrastructure and day-to-day support."}
          </p>
          <Button size="lg" asChild>
            <Link href={`${lp}/kerko-oferte`}>
              {sq ? "Kërko ofertë tani" : "Request a quote now"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
