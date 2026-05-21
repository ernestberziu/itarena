import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { SeoLocale } from "@/lib/seo/config";
import Link from "next/link";
import {
  Monitor, Zap, Shield, Clock, CheckCircle2,
  Phone, ArrowRight, Headphones,
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
    page: "remoteSupport",
  });
}

const steps = [
  {
    icon: Phone,
    color: "bg-blue-50 text-blue-600",
    stepSq: "1. Na kontaktoni",
    stepEn: "1. Contact us",
    descSq: "Telefononi +355 69 63 14 319 ose dërgoni ticket dhe teknicieni ynë do t'ju kontaktojë brenda minutave.",
    descEn: "Call +355 69 63 14 319 or send a ticket and our technician will contact you within minutes.",
  },
  {
    icon: Monitor,
    color: "bg-violet-50 text-violet-600",
    stepSq: "2. Lidhja remote",
    stepEn: "2. Remote connection",
    descSq: "Teknicieni ynë kërkon leje për lidhje remote (TeamViewer/AnyDesk). Ju shihni çdo veprim ekranin tuaj.",
    descEn: "Our technician requests permission for remote connection (TeamViewer/AnyDesk). You see every action on your screen.",
  },
  {
    icon: Zap,
    color: "bg-amber-50 text-amber-600",
    stepSq: "3. Zgjidhja e problemit",
    stepEn: "3. Problem resolution",
    descSq: "Teknicieni i çertifikuar diagnostikon dhe zgjidh problemin — ndërkohë ju mund të vazhdoni punën tuaj.",
    descEn: "The certified technician diagnoses and resolves the issue — meanwhile you can continue your work.",
  },
  {
    icon: Shield,
    color: "bg-emerald-50 text-emerald-600",
    stepSq: "4. Konfirmimi",
    stepEn: "4. Confirmation",
    descSq: "Lidhja mbyllet vetëm kur ju konfirmoni se problemi është zgjidhur. Merrni raport të shkurtër.",
    descEn: "The connection closes only when you confirm the problem is resolved. You receive a brief report.",
  },
];

const capabilities = [
  { sq: "Konfigurimi i PC/Laptop/Mac", en: "PC/Laptop/Mac configuration" },
  { sq: "Instalim dhe riinstalim Windows", en: "Windows installation and reinstallation" },
  { sq: "Zgjidhja e problemeve email (Outlook/Gmail)", en: "Email troubleshooting (Outlook/Gmail)" },
  { sq: "Mirëmbajtja e antivirus dhe sigurisë", en: "Antivirus and security maintenance" },
  { sq: "Backup dhe rivendosja e të dhënave", en: "Data backup and recovery" },
  { sq: "Konfigurimi i printerëve dhe pajisjeve", en: "Printer and device configuration" },
  { sq: "VPN setup dhe troubleshooting", en: "VPN setup and troubleshooting" },
  { sq: "Microsoft 365 / Google Workspace", en: "Microsoft 365 / Google Workspace" },
  { sq: "Probleme rrjeti dhe internet", en: "Network and internet issues" },
  { sq: "Optimizimi i performancës PC", en: "PC performance optimization" },
];

export default async function MbeshtetjeRemotePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lp = locale === "sq" ? "" : `/${locale}`;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-blue-700 to-violet-700 text-white py-24 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="container relative mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/25 px-5 py-2 text-sm text-white/80 mb-6">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            {locale === "sq" ? "Online tani — Reagim 15 min" : "Online now — 15 min response"}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-5">
            {locale === "sq" ? "Mbështetje Remote Teknike" : "Remote Technical Support"}
          </h1>
          <p className="text-white/70 text-lg mb-10">
            {locale === "sq"
              ? "Zgjidhim problemet tuaja IT pa lëvizur nga zyra juaj. Lidhje e sigurt, teknicien i çertifikuar, rezultate të garantuara."
              : "We solve your IT problems without you leaving your office. Secure connection, certified technician, guaranteed results."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="accent">
              <a href="tel:+355696314319">
                <Phone className="mr-2 h-5 w-5" />
                +355 69 63 14 319
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href={`${lp}/kerko-oferte`}>
                {locale === "sq" ? "Hap Ticket" : "Open Ticket"}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { val: "<15 min", labelSq: "Koha mesatare reagimi", labelEn: "Average response time" },
              { val: "98%", labelSq: "Zgjidhje në seancën e parë", labelEn: "First-session resolution" },
              { val: "24/7", labelSq: "Disponueshmëri", labelEn: "Availability" },
              { val: "256-bit", labelSq: "Enkriptim SSL", labelEn: "SSL Encryption" },
            ].map((s) => (
              <div key={s.val}>
                <div className="text-3xl font-extrabold text-primary mb-1">{s.val}</div>
                <div className="text-xs text-muted-foreground">{locale === "sq" ? s.labelSq : s.labelEn}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold mb-3">
              {locale === "sq" ? "Si Funksionon" : "How It Works"}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s) => (
              <div key={s.stepEn} className="rounded-2xl bg-white border border-border/60 p-6 shadow-sm">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${s.color} mb-4`}>
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold mb-2">{locale === "sq" ? s.stepSq : s.stepEn}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{locale === "sq" ? s.descSq : s.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-16 bg-white border-t">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-center mb-10">
            {locale === "sq" ? "Çfarë Zgjidhim Remotely" : "What We Solve Remotely"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 max-w-4xl mx-auto">
            {capabilities.map((c) => (
              <div key={c.en} className="flex items-center gap-2 rounded-xl border border-border/60 bg-slate-50 p-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-xs font-medium">{locale === "sq" ? c.sq : c.en}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[hsl(222,47%,9%)] text-white">
        <div className="container mx-auto px-4 text-center">
          <Headphones className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-extrabold mb-4">
            {locale === "sq" ? "Keni Problem Tani?" : "Have a Problem Right Now?"}
          </h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            {locale === "sq"
              ? "Teknicienët tanë janë gati. Telefononi dhe do të fillojmë sesionin remote brenda minutave."
              : "Our technicians are ready. Call and we'll start the remote session within minutes."}
          </p>
          <Button asChild size="lg" variant="default">
            <a href="tel:+355696314319">
              <Phone className="mr-2 h-5 w-5" />
              +355 69 63 14 319
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
