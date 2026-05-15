import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  Headphones, Cloud, Camera, Globe, Wifi, Code2,
  Phone, Printer, ArrowRight, CheckCircle2, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "sq" ? "Shërbimet Tona — IT Arena" : "Our Services — IT Arena",
    description:
      locale === "sq"
        ? "8 divizione shërbimi IT për bizneset shqiptare. IT Support, Cloud, CCTV, Web & Marketing dhe më shumë."
        : "8 IT service divisions for Albanian businesses. IT Support, Cloud, CCTV, Web & Marketing and more.",
  };
}

const services = [
  {
    slug: "it-support",
    icon: Headphones,
    color: "bg-blue-50 text-blue-600 border-blue-100",
    accent: "from-blue-600 to-blue-700",
    nameSq: "IT Support & Helpdesk",
    nameEn: "IT Support & Helpdesk",
    descSq: "Mbështetje teknike 24/7 me SLA të garantuara. Zgjidhim problemet tuaja IT brenda minutave, jo orëve.",
    descEn: "24/7 technical support with guaranteed SLAs. We solve your IT problems in minutes, not hours.",
    featuresSq: ["Ticket system prioritar", "Remote & onsite support", "SLA 1-4 orë", "Menaxhim assetesh"],
    featuresEn: ["Priority ticket system", "Remote & onsite support", "1-4h SLA", "Asset management"],
  },
  {
    slug: "cloud",
    icon: Cloud,
    color: "bg-sky-50 text-sky-600 border-sky-100",
    accent: "from-sky-500 to-blue-600",
    nameSq: "Cloud & Microsoft 365",
    nameEn: "Cloud & Microsoft 365",
    descSq: "Migrimi, konfigurimi dhe menaxhimi i mjediseve cloud. Partner i çertifikuar Microsoft.",
    descEn: "Migration, configuration and management of cloud environments. Certified Microsoft partner.",
    featuresSq: ["Microsoft 365 / Azure", "Cloud backup & DR", "Virtualizim (Hyper-V/VMware)", "Email profesional"],
    featuresEn: ["Microsoft 365 / Azure", "Cloud backup & DR", "Virtualization (Hyper-V/VMware)", "Professional email"],
  },
  {
    slug: "cctv-siguri",
    icon: Camera,
    color: "bg-rose-50 text-rose-600 border-rose-100",
    accent: "from-rose-500 to-red-600",
    nameSq: "CCTV & Sisteme Sigurie",
    nameEn: "CCTV & Security Systems",
    descSq: "Projektim dhe instalim i sistemeve CCTV, kontroll aksesi dhe sisteme alarmi. Partnerë Hikvision dhe Dahua.",
    descEn: "Design and installation of CCTV, access control and alarm systems. Hikvision and Dahua partners.",
    featuresSq: ["CCTV HD/4K/AI", "Kontroll aksesi", "Alarme & detektim zjarri", "Monitorim në distancë"],
    featuresEn: ["HD/4K/AI CCTV", "Access control", "Alarms & fire detection", "Remote monitoring"],
  },
  {
    slug: "web-marketing",
    icon: Globe,
    color: "bg-violet-50 text-violet-600 border-violet-100",
    accent: "from-violet-600 to-purple-700",
    nameSq: "Web & Marketing Dixhital",
    nameEn: "Web & Digital Marketing",
    descSq: "Zhvillim faqesh interneti, SEO, Google Ads dhe Social Media Marketing. Fitoni klientë të rinj online.",
    descEn: "Website development, SEO, Google Ads and Social Media Marketing. Gain new clients online.",
    featuresSq: ["Faqe interneti profesionale", "SEO & Google Ads", "Social Media Management", "Email marketing"],
    featuresEn: ["Professional websites", "SEO & Google Ads", "Social Media Management", "Email marketing"],
  },
  {
    slug: "rrjet",
    icon: Wifi,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    accent: "from-emerald-500 to-teal-600",
    nameSq: "Rrjet & Infrastrukturë",
    nameEn: "Network & Infrastructure",
    descSq: "Projektim, instalim dhe menaxhim i infrastrukturës së rrjetit — strukturuar dhe wireless.",
    descEn: "Design, installation and management of network infrastructure — structured cabling and wireless.",
    featuresSq: ["Rrjet LAN/WAN/WiFi", "Kablim strukturor", "Firewall & VPN", "Monitorim 24/7"],
    featuresEn: ["LAN/WAN/WiFi network", "Structured cabling", "Firewall & VPN", "24/7 monitoring"],
  },
  {
    slug: "software",
    icon: Code2,
    color: "bg-amber-50 text-amber-600 border-amber-100",
    accent: "from-amber-500 to-orange-600",
    nameSq: "Zhvillim Softuerësh",
    nameEn: "Software Development",
    descSq: "Zhvillim i aplikacioneve web dhe mobile të personalizuara sipas nevojave specifike të biznesit tuaj.",
    descEn: "Development of custom web and mobile applications tailored to your specific business needs.",
    featuresSq: ["Web apps (React/Next.js)", "Mobile apps (iOS & Android)", "API & integrime", "Mirëmbajtje & hosting"],
    featuresEn: ["Web apps (React/Next.js)", "Mobile apps (iOS & Android)", "APIs & integrations", "Maintenance & hosting"],
  },
  {
    slug: "telekomunikacion",
    icon: Phone,
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    accent: "from-indigo-500 to-blue-600",
    nameSq: "Telekomunikacion & VoIP",
    nameEn: "Telecommunications & VoIP",
    descSq: "Sisteme telefonike IP, centrale VoIP dhe zgjidhje komunikimi të unifikuar për biznese.",
    descEn: "IP phone systems, VoIP PBX, and unified communications solutions for businesses.",
    featuresSq: ["Centrale VoIP (Asterisk/3CX)", "IP Phones & video-konferencing", "SIP trunking", "Numra virtualë"],
    featuresEn: ["VoIP PBX (Asterisk/3CX)", "IP phones & video conferencing", "SIP trunking", "Virtual numbers"],
  },
  {
    slug: "printere",
    icon: Printer,
    color: "bg-orange-50 text-orange-600 border-orange-100",
    accent: "from-orange-500 to-red-500",
    nameSq: "Printerë & Shërbime Printimi",
    nameEn: "Printers & Print Services",
    descSq: "Shitje, instalim dhe mirëmbajtje e printerëve dhe fotokopjuesve. Kontrata mirëmbajtjeje me kosto fikse.",
    descEn: "Sale, installation and maintenance of printers and copiers. Fixed-cost maintenance contracts.",
    featuresSq: ["Printerë HP, Canon, Epson", "MFP & fotokopjues", "Kontrata managed print", "Furnizim toner & letër"],
    featuresEn: ["HP, Canon, Epson printers", "MFP & copiers", "Managed print contracts", "Toner & paper supply"],
  },
];

export default async function SherbimePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lp = locale === "sq" ? "" : `/${locale}`;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-[hsl(222,47%,9%)] text-white py-20 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-amber-500/10 blur-3xl" />
        </div>
        <div className="container relative mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-5 py-2 text-sm text-white/70 mb-6">
            <Zap className="h-4 w-4 text-amber-400" />
            {locale === "sq" ? "8 Divizione Shërbimi" : "8 Service Divisions"}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-5 leading-tight">
            {locale === "sq" ? "Zgjidhje IT Gjithëpërfshirëse" : "Comprehensive IT Solutions"}
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10">
            {locale === "sq"
              ? "Nga mbështetja ditore deri te transformimi dixhital — IT Arena mbulon çdo nevojë teknologjike të biznesit tuaj."
              : "From daily support to digital transformation — IT Arena covers every technology need of your business."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
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

      {/* Services grid */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              {locale === "sq" ? "Çfarë Ofrojmë" : "What We Offer"}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {locale === "sq"
                ? "Çdo shërbim vjen me SLA të garantuara, ekip të dedikuar dhe raportim transparent."
                : "Every service comes with guaranteed SLAs, a dedicated team, and transparent reporting."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {services.map((svc) => {
              const Icon = svc.icon;
              const name = locale === "sq" ? svc.nameSq : svc.nameEn;
              const desc = locale === "sq" ? svc.descSq : svc.descEn;
              const features = locale === "sq" ? svc.featuresSq : svc.featuresEn;
              return (
                <Link
                  key={svc.slug}
                  href={`${lp}/sherbime/${svc.slug}`}
                  className="group"
                >
                  <div className="h-full rounded-2xl bg-white border border-border/60 overflow-hidden hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1">
                    <div className={`h-1.5 w-full bg-gradient-to-r ${svc.accent}`} />
                    <div className="p-6">
                      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border ${svc.color} mb-5`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-extrabold text-lg mb-2 group-hover:text-primary transition-colors">
                        {name}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-5">{desc}</p>
                      <ul className="space-y-2">
                        {features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        {locale === "sq" ? "Mëso më shumë" : "Learn more"}
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold mb-4">
            {locale === "sq" ? "Gati të Filloni?" : "Ready to Start?"}
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            {locale === "sq"
              ? "Kontaktoni ekipin tonë dhe merrni një ofertë falas brenda 24 orëve."
              : "Contact our team and get a free quote within 24 hours."}
          </p>
          <Button asChild size="lg" variant="accent">
            <Link href={`${lp}/kerko-oferte`}>
              {locale === "sq" ? "Kërko Ofertë Falas" : "Get Free Quote"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
