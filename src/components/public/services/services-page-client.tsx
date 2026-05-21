"use client";

import Link from "next/link";
import { ArrowRight, HeadphonesIcon, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MarketingServiceRecord } from "@/lib/site-content/types";
import { HomeServiceCard } from "@/components/public/home-service-card";

type Props = {
  services: MarketingServiceRecord[];
  locale: string;
  lp: string;
};

export function ServicesPageClient({ services, locale, lp }: Props) {
  const sq = locale === "sq";
  const homepageServices = services.filter((s) => s.showOnHomepage);
  const gridServices = homepageServices.length > 0 ? homepageServices : services;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden mesh-gradient py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
        </div>
        <div className="container relative mx-auto max-w-4xl px-4 text-center">
          <span className="mb-5 inline-block rounded-full border-2 border-primary/20 bg-primary/10 px-5 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
            {sq ? "8 divizione" : "8 divisions"}
          </span>
          <h1 className="mb-5 text-4xl font-black tracking-tight md:text-5xl lg:text-6xl">
            {sq ? "Shërbimet Tona" : "Our Services"}
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-medium text-muted-foreground md:text-xl">
            {sq
              ? "Zgjidhje teknologjike të plota — nga helpdesk 24/7 deri te projekte infrastrukture dhe zhvillim softuerësh."
              : "Complete technology solutions — from 24/7 helpdesk to infrastructure projects and custom software."}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild className="min-h-12 rounded-xl px-8">
              <Link href={`${lp}/kerko-oferte`}>
                {sq ? "Kërko ofertë" : "Get a quote"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="min-h-12 rounded-xl px-8">
              <Link href={`${lp}/kontakt`}>{sq ? "Konsultë falas" : "Free consultation"}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border/50 bg-slate-50/80">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                icon: Zap,
                title: sq ? "SLA të garantuara" : "Guaranteed SLAs",
                desc: sq ? "Reagim i matshëm, jo premtime" : "Measurable response, not promises",
              },
              {
                icon: Shield,
                title: sq ? "ISO 27001" : "ISO 27001",
                desc: sq ? "Siguri në nivel enterprise" : "Enterprise-grade security",
              },
              {
                icon: HeadphonesIcon,
                title: "24/7",
                desc: sq ? "Mbështetje emergjence" : "Emergency support",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-4 rounded-2xl border border-border/60 bg-white px-5 py-4 shadow-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" strokeWidth={2} />
                </div>
                <div>
                  <p className="font-bold text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento grid — same pattern as homepage */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="mb-4 text-2xl font-extrabold md:text-3xl">
              {sq ? "Zgjidhni fushën tuaj" : "Choose your area"}
            </h2>
            <p className="text-muted-foreground">
              {sq
                ? "Klikoni një kartë për detaje, përfitime dhe ofertë të personalizuar."
                : "Click a card for details, benefits, and a tailored quote."}
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {gridServices.map((svc, index, arr) => (
              <HomeServiceCard
                key={svc.id}
                svc={svc}
                locale={locale}
                lp={lp}
                index={index}
                total={arr.length}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-border/50 bg-gradient-to-br from-primary via-blue-700 to-violet-700 py-16 text-white md:py-20">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-4 text-2xl font-extrabold md:text-3xl">
            {sq ? "Nuk jeni të sigurt ku të filloni?" : "Not sure where to start?"}
          </h2>
          <p className="mb-8 text-white/80">
            {sq
              ? "Na tregoni sfidën tuaj — ekipi ynë do t'ju drejtojë te divizioni i duhur."
              : "Tell us your challenge — our team will guide you to the right division."}
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href={`${lp}/kontakt`}>
              {sq ? "Flisni me një ekspert" : "Talk to an expert"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
