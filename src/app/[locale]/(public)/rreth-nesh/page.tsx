import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { SeoLocale } from "@/lib/seo/config";
import Link from "next/link";
import {
  Users, Award, Clock, Shield, Target, Heart,
  CheckCircle2, ArrowRight, Zap, Globe, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale: (locale === "en" ? "en" : "sq") as SeoLocale,
    page: "about",
  });
}

export default async function RrethNeshPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lp = locale === "sq" ? "" : `/${locale}`;

  const values = [
    {
      icon: Shield,
      color: "bg-blue-50 text-blue-600",
      titleSq: "Besueshmëria",
      titleEn: "Reliability",
      descSq: "Çdo angazhim shoqërohet me SLA të shkruara dhe transparencë të plotë. Bëjmë çfarë themi.",
      descEn: "Every engagement comes with written SLAs and full transparency. We do what we say.",
    },
    {
      icon: Zap,
      color: "bg-amber-50 text-amber-600",
      titleSq: "Inovacioni",
      titleEn: "Innovation",
      descSq: "Qëndrojmë në krah me teknologjitë më të reja dhe i sjellim ato tek bizneset shqiptare.",
      descEn: "We stay ahead of the latest technologies and bring them to Albanian businesses.",
    },
    {
      icon: Heart,
      color: "bg-rose-50 text-rose-600",
      titleSq: "Partneritet",
      titleEn: "Partnership",
      descSq: "Nuk jemi thjesht ofrues shërbimi — jemi partnerë afatgjatë të rritjes suaj.",
      descEn: "We're not just a service provider — we're your long-term growth partners.",
    },
    {
      icon: Target,
      color: "bg-emerald-50 text-emerald-600",
      titleSq: "Rezultate",
      titleEn: "Results",
      descSq: "Çdo projekt matet me rezultate konkrete dhe KPI-t e dakorduara me klientin.",
      descEn: "Every project is measured by concrete results and KPIs agreed with the client.",
    },
  ];

  const certifications = [
    "Microsoft Partner Gold",
    "Cisco Certified Partner",
    "Ubiquiti Elite",
    "Hikvision Authorized",
    "ISO 9001:2015",
    "ISO 27001:2022",
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-[hsl(222,47%,9%)] text-white py-24 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-amber-500/10 blur-3xl" />
        </div>
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-5 py-2 text-sm text-white/70 mb-6">
              <Globe className="h-4 w-4 text-amber-400" />
              {locale === "sq" ? "Kush Jemi Ne" : "Who We Are"}
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              {locale === "sq" ? (
                <>Ndërtojmë të Ardhmen <span className="text-amber-400">Dixhitale</span> të Shqipërisë</>
              ) : (
                <>Building Albania&apos;s <span className="text-amber-400">Digital Future</span></>
              )}
            </h1>
            <p className="text-white/65 text-lg leading-relaxed max-w-2xl">
              {locale === "sq"
                ? "IT Arena u themelua me misionin për t'i sjellë teknologjitë enterprise tek bizneset shqiptare me çmime të aksesueshme dhe cilësi botërore. 12+ vite më vonë, jemi partneri i besuar i 500+ bizneseve."
                : "IT Arena was founded with the mission to bring enterprise technologies to Albanian businesses at accessible prices and world-class quality. 12+ years later, we are the trusted partner of 500+ businesses."}
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, val: "500+", labelSq: "Klientë Aktivë", labelEn: "Active Clients", color: "text-blue-600 bg-blue-50" },
              { icon: Clock, val: "12+", labelSq: "Vite Eksperiencë", labelEn: "Years of Experience", color: "text-amber-600 bg-amber-50" },
              { icon: Award, val: "50+", labelSq: "Inxhinierë Çertifikuar", labelEn: "Certified Engineers", color: "text-emerald-600 bg-emerald-50" },
              { icon: TrendingUp, val: "98%", labelSq: "Shkallë Kënaqësie", labelEn: "Satisfaction Rate", color: "text-violet-600 bg-violet-50" },
            ].map((s) => (
              <div key={s.val} className="text-center">
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${s.color} mb-4`}>
                  <s.icon className="h-7 w-7" />
                </div>
                <div className="text-4xl font-extrabold mb-1">{s.val}</div>
                <div className="text-sm text-muted-foreground">{locale === "sq" ? s.labelSq : s.labelEn}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-4">
                {locale === "sq" ? "Historia Jonë" : "Our Story"}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
                {locale === "sq" ? "Nga Garazhi tek Kompania Lider IT" : "From Garage to Leading IT Company"}
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  {locale === "sq"
                    ? "IT Arena filloi në vitin 2012 me dy inxhinierë të rinj dhe një vizion: t'i ofrojnë bizneset shqiptare teknologjinë enterprise që kishin nevojë, por nuk mund ta jepnin. Sot, me 50+ profesionistë, jemi kompania kryesore IT e Tiranës."
                    : "IT Arena started in 2012 with two young engineers and a vision: to offer Albanian businesses the enterprise technology they needed but couldn't afford. Today, with 50+ professionals, we are Tirana's leading IT company."}
                </p>
                <p>
                  {locale === "sq"
                    ? "Çertifikimet tona — Microsoft Gold Partner, Cisco Certified, ISO 9001 dhe ISO 27001 — janë dëshmi i angazhimit tonë ndaj standardeve ndërkombëtare. Por suksesi ynë i vërtetë matet me besimin e klientëve tanë."
                    : "Our certifications — Microsoft Gold Partner, Cisco Certified, ISO 9001 and ISO 27001 — testify to our commitment to international standards. But our real success is measured by our clients' trust."}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { yearSq: "2012", labelSq: "Themelimi i IT Arena", labelEn: "IT Arena Founded" },
                { yearSq: "2015", labelSq: "Microsoft Gold Partner", labelEn: "Microsoft Gold Partner" },
                { yearSq: "2018", labelSq: "Zgjerim — 50+ klientë enterprise", labelEn: "Expansion — 50+ enterprise clients" },
                { yearSq: "2021", labelSq: "ISO 27001 Çertifikim", labelEn: "ISO 27001 Certification" },
                { yearSq: "2023", labelSq: "500+ klientë aktivë", labelEn: "500+ active clients" },
                { yearSq: "2024", labelSq: "Hapja e IT Arena Shop", labelEn: "IT Arena Shop launch" },
              ].map((m) => (
                <div key={m.yearSq} className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
                  <div className="text-2xl font-extrabold text-primary mb-1">{m.yearSq}</div>
                  <p className="text-sm text-muted-foreground">{locale === "sq" ? m.labelSq : m.labelEn}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              {locale === "sq" ? "Vlerat Tona" : "Our Values"}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.titleEn} className="rounded-2xl bg-white border border-border/60 p-6 shadow-sm text-center">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${v.color} mb-4`}>
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold mb-2">{locale === "sq" ? v.titleSq : v.titleEn}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{locale === "sq" ? v.descSq : v.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 bg-slate-50 border-t">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold mb-2">
              {locale === "sq" ? "Çertifikime & Partneritete" : "Certifications & Partnerships"}
            </h2>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {certifications.map((cert) => (
              <div key={cert} className="flex items-center gap-2 rounded-2xl border border-border/60 bg-white px-6 py-3 shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="font-semibold text-sm">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-extrabold text-primary-foreground">
            {locale === "sq" ? "Bëhuni Partneri Ynë i Ardhshëm" : "Become Our Next Partner"}
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-primary-foreground/90">
            {locale === "sq"
              ? "500+ biznese na besojnë çdo ditë. Jini i ardhshëm."
              : "500+ businesses trust us every day. Be the next."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="accent">
              <Link href={`${lp}/kerko-oferte`}>
                {locale === "sq" ? "Kërko Ofertë Falas" : "Get Free Quote"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href={`${lp}/kontakt`}>
                {locale === "sq" ? "Na Kontaktoni" : "Contact Us"}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
