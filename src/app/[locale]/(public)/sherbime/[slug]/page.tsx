import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  Headphones, Cloud, Camera, Globe, Wifi, Code2,
  Phone, Printer, ArrowRight,
  CheckCircle2, Clock, Users, Award, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/** ASCII-only URL; Unicode variants redirect here (avoids 404 / matching issues). */
const PRINTER_SLUG = "printere" as const;
const LEGACY_PRINTER_SLUG = "printerë";

function resolveServiceSlug(slug: string): string {
  if (slug.normalize("NFC") === LEGACY_PRINTER_SLUG.normalize("NFC")) {
    return PRINTER_SLUG;
  }
  return slug;
}

const services = [
  {
    slug: "it-support",
    icon: Headphones,
    accent: "from-blue-600 to-blue-700",
    colorBg: "bg-blue-50",
    colorText: "text-blue-600",
    nameSq: "IT Support & Helpdesk",
    nameEn: "IT Support & Helpdesk",
    taglineSq: "Mbështetje teknike 24/7 me SLA të garantuara",
    taglineEn: "24/7 technical support with guaranteed SLAs",
    descSq: "Ekipi ynë i IT Support ofron ndihmë teknike të menjëhershme për çdo problem kompjuterik, server apo rrjeti. Punojmë me sistem ticket-esh me prioritet dhe SLA-ja jonë garanton kohën e reagimit dhe zgjidhjes.",
    descEn: "Our IT Support team provides immediate technical assistance for any computer, server or network issue. We operate a priority ticket system and our SLA guarantees response and resolution times.",
    featuresSq: [
      "Ticket system me prioritet CRITICAL/HIGH/MEDIUM/LOW",
      "Support remote (TeamViewer, AnyDesk) dhe onsite",
      "SLA garantuara: reagim 1 orë, zgjidhje 4 orë (CRITICAL)",
      "Menaxhim i plotë i asseteve IT",
      "Raportim mujor i performancës",
      "Helpdesk dedicuar me linjë direkte",
    ],
    featuresEn: [
      "Priority ticketing: CRITICAL/HIGH/MEDIUM/LOW",
      "Remote (TeamViewer, AnyDesk) and onsite support",
      "Guaranteed SLA: 1h response, 4h resolution (CRITICAL)",
      "Full IT asset management",
      "Monthly performance reporting",
      "Dedicated helpdesk with direct line",
    ],
    plansSq: [
      { name: "Basic", price: "€199/muaj", desc: "Deri 10 user, 8/5 support, 5 tickets/muaj" },
      { name: "Business", price: "€399/muaj", desc: "Deri 25 user, 12/5 support, tickets të pakufizuara" },
      { name: "Enterprise", price: "€799/muaj", desc: "Nevojat tuaja, 24/7 support, SLA të personalizuara" },
    ],
    plansEn: [
      { name: "Basic", price: "€199/mo", desc: "Up to 10 users, 8/5 support, 5 tickets/month" },
      { name: "Business", price: "€399/mo", desc: "Up to 25 users, 12/5 support, unlimited tickets" },
      { name: "Enterprise", price: "€799/mo", desc: "Your needs, 24/7 support, custom SLAs" },
    ],
  },
  {
    slug: "cloud",
    icon: Cloud,
    accent: "from-sky-500 to-blue-600",
    colorBg: "bg-sky-50",
    colorText: "text-sky-600",
    nameSq: "Cloud & Microsoft 365",
    nameEn: "Cloud & Microsoft 365",
    taglineSq: "Partner i çertifikuar Microsoft për zgjidhje cloud",
    taglineEn: "Certified Microsoft partner for cloud solutions",
    descSq: "Si partner i çertifikuar Microsoft, ofrojmë shërbime complete cloud: migrimi i emailit dhe të dhënave, konfigurimi i Azure dhe Microsoft 365, backup cloud dhe disaster recovery.",
    descEn: "As a certified Microsoft partner, we offer complete cloud services: email and data migration, Azure and Microsoft 365 configuration, cloud backup, and disaster recovery.",
    featuresSq: [
      "Microsoft 365 Business/Enterprise",
      "Azure Infrastructure (VM, Storage, Networking)",
      "Migrimi email Exchange → Microsoft 365",
      "Cloud Backup & Disaster Recovery",
      "Virtualizim Hyper-V dhe VMware",
      "Microsoft Teams & SharePoint",
    ],
    featuresEn: [
      "Microsoft 365 Business/Enterprise",
      "Azure Infrastructure (VM, Storage, Networking)",
      "Email migration Exchange → Microsoft 365",
      "Cloud Backup & Disaster Recovery",
      "Hyper-V and VMware virtualization",
      "Microsoft Teams & SharePoint",
    ],
    plansSq: [
      { name: "Starter", price: "€149/muaj", desc: "Deri 5 user M365 Business Basic + setup + support" },
      { name: "Pro", price: "€349/muaj", desc: "Deri 15 user M365 Business Premium + Azure backup" },
      { name: "Full Cloud", price: "Me kuotë", desc: "Infrastrukturë e plotë cloud sipas nevojave tuaja" },
    ],
    plansEn: [
      { name: "Starter", price: "€149/mo", desc: "Up to 5 users M365 Business Basic + setup + support" },
      { name: "Pro", price: "€349/mo", desc: "Up to 15 users M365 Business Premium + Azure backup" },
      { name: "Full Cloud", price: "By quote", desc: "Complete cloud infrastructure tailored to your needs" },
    ],
  },
  {
    slug: "cctv-siguri",
    icon: Camera,
    accent: "from-rose-500 to-red-600",
    colorBg: "bg-rose-50",
    colorText: "text-rose-600",
    nameSq: "CCTV & Sisteme Sigurie",
    nameEn: "CCTV & Security Systems",
    taglineSq: "Mbrojini biznesin tuaj me teknologji sigurie të avancuar",
    taglineEn: "Protect your business with advanced security technology",
    descSq: "Projektojmë dhe instalojmë sisteme CCTV të avancuara HD/4K/AI, sisteme kontrolli aksesi dhe alarme. Jemi partnerë të çertifikuar Hikvision dhe Dahua.",
    descEn: "We design and install advanced HD/4K/AI CCTV systems, access control systems and alarms. We are certified Hikvision and Dahua partners.",
    featuresSq: [
      "Kamera IP dhe analoge (Hikvision, Dahua)",
      "Sisteme AI me detektim person/automjet",
      "Kontroll aksesi (kartë, biometrik, smartphone)",
      "Sisteme alarmi anti-thyerje dhe anti-zjarr",
      "Monitorim në distancë me aplikacion",
      "Ruajtja e videos: NVR/DVR/Cloud",
    ],
    featuresEn: [
      "IP and analog cameras (Hikvision, Dahua)",
      "AI systems with person/vehicle detection",
      "Access control (card, biometric, smartphone)",
      "Intrusion and fire alarm systems",
      "Remote monitoring via app",
      "Video storage: NVR/DVR/Cloud",
    ],
    plansSq: [
      { name: "Starter 4 Kanale", price: "€890", desc: "4 kamera Full HD + DVR 4K + instalim + konfigurimi" },
      { name: "Business 8 Kanale", price: "€1590", desc: "8 kamera 4MP + DVR + 2TB HDD + instalim" },
      { name: "Enterprise", price: "Me kuotë", desc: "Sisteme të personalizuara për hapësira të mëdha" },
    ],
    plansEn: [
      { name: "Starter 4-Channel", price: "€890", desc: "4 Full HD cameras + 4K DVR + installation + config" },
      { name: "Business 8-Channel", price: "€1590", desc: "8 x 4MP cameras + DVR + 2TB HDD + installation" },
      { name: "Enterprise", price: "By quote", desc: "Custom systems for large premises" },
    ],
  },
  {
    slug: "web-marketing",
    icon: Globe,
    accent: "from-violet-600 to-purple-700",
    colorBg: "bg-violet-50",
    colorText: "text-violet-600",
    nameSq: "Web & Marketing Dixhital",
    nameEn: "Web & Digital Marketing",
    taglineSq: "Prezencë online profesionale dhe rezultate të matshme",
    taglineEn: "Professional online presence and measurable results",
    descSq: "Ndërtojmë faqe interneti moderne dhe menaxhojmë kampanjet tuaja dixhitale. Nga SEO deri te Google Ads dhe Social Media — rezultate të matshme, raportim transparent.",
    descEn: "We build modern websites and manage your digital campaigns. From SEO to Google Ads and Social Media — measurable results, transparent reporting.",
    featuresSq: ["Dizajn & zhvillim web", "SEO On-Page & Off-Page", "Google Ads & Meta Ads", "Social Media Management", "Email Marketing", "Analytics & raportim mujor"],
    featuresEn: ["Web design & development", "On-Page & Off-Page SEO", "Google Ads & Meta Ads", "Social Media Management", "Email Marketing", "Analytics & monthly reporting"],
    plansSq: [
      { name: "Web Starter", price: "€990", desc: "Faqe 5 faqe + SEO bazik + hosting 1 vit" },
      { name: "Digital Pro", price: "€499/muaj", desc: "Web + SEO + Google Ads + Social Media Management" },
      { name: "Full Digital", price: "Me kuotë", desc: "Strategji e plotë dixhitale sipas objektivave tuaja" },
    ],
    plansEn: [
      { name: "Web Starter", price: "€990", desc: "5-page website + basic SEO + 1-year hosting" },
      { name: "Digital Pro", price: "€499/mo", desc: "Web + SEO + Google Ads + Social Media Management" },
      { name: "Full Digital", price: "By quote", desc: "Complete digital strategy tailored to your goals" },
    ],
  },
  {
    slug: "rrjet",
    icon: Wifi,
    accent: "from-emerald-500 to-teal-600",
    colorBg: "bg-emerald-50",
    colorText: "text-emerald-600",
    nameSq: "Rrjet & Infrastrukturë",
    nameEn: "Network & Infrastructure",
    taglineSq: "Infrastrukturë rrjeti e sigurt, e shpejtë dhe e shkallëzueshme",
    taglineEn: "Secure, fast, and scalable network infrastructure",
    descSq: "Projektojmë dhe instalojmë rrjete LAN/WAN/WiFi enterprise me kablim strukturor, firewall, VPN dhe monitorim 24/7. Partnerë Cisco, Ubiquiti dhe Fortinet.",
    descEn: "We design and install enterprise LAN/WAN/WiFi networks with structured cabling, firewall, VPN, and 24/7 monitoring. Cisco, Ubiquiti and Fortinet partners.",
    featuresSq: ["Projektim & instalim rrjeti", "Kablim strukturor Cat6/Cat6A/Fibër", "Firewall (Fortinet, Cisco, pfSense)", "WiFi Enterprise (Ubiquiti, Cisco)", "VPN Site-to-Site & Remote Access", "NOC & monitorim 24/7"],
    featuresEn: ["Network design & installation", "Structured cabling Cat6/Cat6A/Fiber", "Firewall (Fortinet, Cisco, pfSense)", "Enterprise WiFi (Ubiquiti, Cisco)", "VPN Site-to-Site & Remote Access", "NOC & 24/7 monitoring"],
    plansSq: [
      { name: "Office Starter", price: "€1200", desc: "Rrjet LAN deri 20 pajisje + WiFi + firewall bazik" },
      { name: "Business Pro", price: "€2500", desc: "Rrjet i plotë + VLAN + Firewall + VPN + monitorim" },
      { name: "Enterprise", price: "Me kuotë", desc: "Infrastrukturë e personalizuar, NOC dedicuar" },
    ],
    plansEn: [
      { name: "Office Starter", price: "€1200", desc: "LAN network up to 20 devices + WiFi + basic firewall" },
      { name: "Business Pro", price: "€2500", desc: "Full network + VLAN + Firewall + VPN + monitoring" },
      { name: "Enterprise", price: "By quote", desc: "Custom infrastructure, dedicated NOC" },
    ],
  },
  {
    slug: "software",
    icon: Code2,
    accent: "from-amber-500 to-orange-600",
    colorBg: "bg-amber-50",
    colorText: "text-amber-600",
    nameSq: "Zhvillim Softuerësh",
    nameEn: "Software Development",
    taglineSq: "Aplikacione të personalizuara për biznesin tuaj",
    taglineEn: "Custom applications built for your business",
    descSq: "Zhvillojmë aplikacione web dhe mobile të personalizuara duke përdorur teknologji moderne. Nga portale klientësh deri te sisteme komplekse enterprise — me kod të pastër dhe mirëmbajtje afatgjatë.",
    descEn: "We develop custom web and mobile applications using modern technologies. From client portals to complex enterprise systems — with clean code and long-term maintenance.",
    featuresSq: ["Web apps (React, Next.js, Node.js)", "Mobile apps (React Native, Flutter)", "Backend API (REST, GraphQL)", "Database design & optimizim", "Cloud deployment & CI/CD", "Mirëmbajtje & update-s"],
    featuresEn: ["Web apps (React, Next.js, Node.js)", "Mobile apps (React Native, Flutter)", "Backend APIs (REST, GraphQL)", "Database design & optimization", "Cloud deployment & CI/CD", "Maintenance & updates"],
    plansSq: [
      { name: "MVP", price: "€2500+", desc: "Aplikacion bazik me funksionalitete core, 6 javë" },
      { name: "Pro App", price: "€8000+", desc: "Aplikacion i plotë me autentifikim, admin panel, API" },
      { name: "Enterprise", price: "Me kuotë", desc: "Projekte komplekse, integrime, skalim" },
    ],
    plansEn: [
      { name: "MVP", price: "€2500+", desc: "Basic application with core features, 6 weeks" },
      { name: "Pro App", price: "€8000+", desc: "Full app with auth, admin panel, API" },
      { name: "Enterprise", price: "By quote", desc: "Complex projects, integrations, scaling" },
    ],
  },
  {
    slug: "telekomunikacion",
    icon: Phone,
    accent: "from-indigo-500 to-blue-600",
    colorBg: "bg-indigo-50",
    colorText: "text-indigo-600",
    nameSq: "Telekomunikacion & VoIP",
    nameEn: "Telecommunications & VoIP",
    taglineSq: "Komunikim profesional me kosto të ulët",
    taglineEn: "Professional communication at low cost",
    descSq: "Ofrojmë sisteme telefonike IP të avancuara me centrale VoIP, softfone, video-konferencing dhe numra virtualë. Ulni kostot e komunikimit me deri 70% duke ruajtur cilësinë.",
    descEn: "We offer advanced IP phone systems with VoIP PBX, softphones, video conferencing and virtual numbers. Reduce communication costs by up to 70% while maintaining quality.",
    featuresSq: ["Centrale VoIP Asterisk/3CX", "IP Phones (Yealink, Grandstream)", "Softfone (PC, Mac, Mobile)", "Video-konferencing (Zoom, Teams)", "SIP trunking & numra virtualë", "IVR & receptionist virtual"],
    featuresEn: ["VoIP PBX Asterisk/3CX", "IP Phones (Yealink, Grandstream)", "Softphones (PC, Mac, Mobile)", "Video conferencing (Zoom, Teams)", "SIP trunking & virtual numbers", "IVR & virtual receptionist"],
    plansSq: [
      { name: "Starter", price: "€890", desc: "Qendër VoIP + 5 IP Phones + SIP trunk + instalim" },
      { name: "Business", price: "€1890", desc: "Qendër VoIP + 15 phones + IVR + softfone" },
      { name: "Enterprise", price: "Me kuotë", desc: "Multi-site, call center, integrime të avancuara" },
    ],
    plansEn: [
      { name: "Starter", price: "€890", desc: "VoIP PBX + 5 IP Phones + SIP trunk + install" },
      { name: "Business", price: "€1890", desc: "VoIP PBX + 15 phones + IVR + softphones" },
      { name: "Enterprise", price: "By quote", desc: "Multi-site, call center, advanced integrations" },
    ],
  },
  {
    slug: PRINTER_SLUG,
    icon: Printer,
    accent: "from-orange-500 to-red-500",
    colorBg: "bg-orange-50",
    colorText: "text-orange-600",
    nameSq: "Printerë & Shërbime Printimi",
    nameEn: "Printers & Print Services",
    taglineSq: "Menaxhim printimi me kosto fikse dhe pa surpriza",
    taglineEn: "Print management at fixed cost with no surprises",
    descSq: "Shesim, instalojmë dhe mirëmbajmë printerë dhe fotokopjues të të gjitha markave. Kontratat tona managed print ofrojnë kosto fikse me faqe, duke eliminuar surprizat.",
    descEn: "We sell, install and maintain printers and copiers of all brands. Our managed print contracts offer fixed per-page costs, eliminating surprises.",
    featuresSq: ["Printerë HP, Canon, Epson, Brother", "MFP A3/A4 me faksim dhe skanim", "Kontrata Managed Print Service", "Riparim & mirëmbajtje preventive", "Furnizim toner origjinal", "Monitorim i nivelit të tonerit"],
    featuresEn: ["HP, Canon, Epson, Brother printers", "A3/A4 MFP with fax and scan", "Managed Print Service contracts", "Repair & preventive maintenance", "Genuine toner supply", "Toner level monitoring"],
    plansSq: [
      { name: "Pay Per Page", price: "€0.008/faqe B&W", desc: "Pagesa vetëm për faqet e printuara, asnjë surprizë" },
      { name: "Business Bundle", price: "€89/muaj", desc: "Deri 1000 faqe/muaj B&W + mirëmbajtje + toner" },
      { name: "Enterprise", price: "Me kuotë", desc: "Fleet management për >5 printerë" },
    ],
    plansEn: [
      { name: "Pay Per Page", price: "€0.008/page B&W", desc: "Pay only for printed pages, no surprises" },
      { name: "Business Bundle", price: "€89/mo", desc: "Up to 1000 B&W pages/month + maintenance + toner" },
      { name: "Enterprise", price: "By quote", desc: "Fleet management for 5+ printers" },
    ],
  },
] as const;

export async function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolvedSlug = resolveServiceSlug(slug);
  const svc = services.find((s) => s.slug === resolvedSlug);
  if (!svc) return {};
  return {
    title: `${locale === "sq" ? svc.nameSq : svc.nameEn} — IT Arena`,
    description: locale === "sq" ? svc.taglineSq : svc.taglineEn,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const resolvedSlug = resolveServiceSlug(slug);
  if (resolvedSlug !== slug) {
    const base = locale === "en" ? "/en" : "";
    redirect(`${base}/sherbime/${resolvedSlug}`);
  }
  const svc = services.find((s) => s.slug === resolvedSlug);
  if (!svc) notFound();

  const lp = locale === "sq" ? "" : `/${locale}`;
  const Icon = svc.icon;
  const name = locale === "sq" ? svc.nameSq : svc.nameEn;
  const tagline = locale === "sq" ? svc.taglineSq : svc.taglineEn;
  const desc = locale === "sq" ? svc.descSq : svc.descEn;
  const features = locale === "sq" ? svc.featuresSq : svc.featuresEn;
  const plans = locale === "sq" ? svc.plansSq : svc.plansEn;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className={`bg-gradient-to-br ${svc.accent} text-white py-20 relative overflow-hidden`}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[200px] w-[200px] rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="container relative mx-auto px-4">
          <div className="mb-4">
            <Link
              href={`${lp}/sherbime`}
              className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors"
            >
              ← {locale === "sq" ? "Të gjitha shërbimet" : "All services"}
            </Link>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
              <Icon className="h-9 w-9" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">{name}</h1>
          <p className="text-xl text-white/75 max-w-2xl">{tagline}</p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left: features */}
            <div className="lg:col-span-2 space-y-8">
              <div className="rounded-2xl bg-white border border-border/60 p-8 shadow-sm">
                <h2 className="text-2xl font-extrabold mb-4">
                  {locale === "sq" ? "Çfarë Përfshihet" : "What's Included"}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">{desc}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {features.map((f) => (
                    <div key={f} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Users, val: "500+", label: locale === "sq" ? "Klientë" : "Clients" },
                  { icon: Clock, val: "12+", label: locale === "sq" ? "Vite" : "Years" },
                  { icon: Award, val: "98%", label: locale === "sq" ? "Kënaqësi" : "Satisfaction" },
                ].map((s) => (
                  <div key={s.val} className="rounded-2xl bg-white border border-border/60 p-5 text-center shadow-sm">
                    <s.icon className="h-6 w-6 mx-auto text-primary mb-2" />
                    <div className="text-2xl font-extrabold">{s.val}</div>
                    <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: pricing + CTA */}
            <div className="space-y-5">
              <div className="rounded-2xl bg-white border border-border/60 p-6 shadow-sm">
                <h3 className="font-extrabold text-lg mb-5">
                  {locale === "sq" ? "Planet & Çmimet" : "Plans & Pricing"}
                </h3>
                <div className="space-y-4">
                  {plans.map((plan, i) => (
                    <div
                      key={plan.name}
                      className={`rounded-xl border p-4 ${i === 1 ? `border-primary/30 bg-primary/5` : "border-border/60"}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm">{plan.name}</span>
                        <span className={`text-sm font-extrabold ${i === 1 ? "text-primary" : ""}`}>
                          {plan.price}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{plan.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`rounded-2xl bg-gradient-to-br ${svc.accent} p-6 text-white`}>
                <Zap className="h-6 w-6 mb-3" />
                <h3 className="font-extrabold text-lg mb-2">
                  {locale === "sq" ? "Gati të filloni?" : "Ready to start?"}
                </h3>
                <p className="text-white/75 text-sm mb-5">
                  {locale === "sq"
                    ? "Merrni ofertën tuaj falas brenda 24 orëve."
                    : "Get your free quote within 24 hours."}
                </p>
                <Button asChild variant="accent" className="w-full">
                  <Link href={`${lp}/kerko-oferte`}>
                    {locale === "sq" ? "Kërko Ofertë Falas" : "Get Free Quote"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
