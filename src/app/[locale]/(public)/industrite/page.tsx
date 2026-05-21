import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { SeoLocale } from "@/lib/seo/config";
import Link from "next/link";
import {
  ShoppingBag, Landmark, HeartPulse, GraduationCap,
  Utensils, Building2, Truck, Factory, ArrowRight, CheckCircle2,
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
    page: "industries",
  });
}

const industries = [
  {
    icon: ShoppingBag,
    color: "bg-blue-50 text-blue-600 border-blue-100",
    accent: "from-blue-600 to-blue-700",
    nameSq: "Retail & E-Commerce",
    nameEn: "Retail & E-Commerce",
    descSq: "Sisteme POS, menaxhim inventari, e-commerce dhe mbështetje IT për dyqanet fizike dhe online.",
    descEn: "POS systems, inventory management, e-commerce, and IT support for physical and online stores.",
    solutionsSq: ["Sisteme POS të integruar", "Menaxhim inventar real-time", "Faqe e-commerce", "Kamera CCTV dyqan"],
    solutionsEn: ["Integrated POS systems", "Real-time inventory management", "E-commerce websites", "Store CCTV cameras"],
    clientsSq: "50+ dyqane dhe supermarkete",
    clientsEn: "50+ shops and supermarkets",
  },
  {
    icon: Landmark,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    accent: "from-emerald-600 to-teal-700",
    nameSq: "Banka & Financa",
    nameEn: "Banking & Finance",
    descSq: "Infrastrukturë rrjeti e sigurt, ISO 27001, backup & DR dhe sisteme sigurie fizike për institucione financiare.",
    descEn: "Secure network infrastructure, ISO 27001, backup & DR and physical security systems for financial institutions.",
    solutionsSq: ["Rrjet zero-trust", "ISO 27001 çertifikim", "Backup & Disaster Recovery", "CCTV & Kontroll aksesi"],
    solutionsEn: ["Zero-trust network", "ISO 27001 certification", "Backup & Disaster Recovery", "CCTV & access control"],
    clientsSq: "20+ institucione financiare",
    clientsEn: "20+ financial institutions",
  },
  {
    icon: HeartPulse,
    color: "bg-rose-50 text-rose-600 border-rose-100",
    accent: "from-rose-500 to-red-600",
    nameSq: "Kujdes Shëndetësor",
    nameEn: "Healthcare",
    descSq: "Rrjete të dedikuara, sistemet EHR, backup i sigurt i të dhënave dhe compliance HIPAA/GDPR për klinuka dhe spitale.",
    descEn: "Dedicated networks, EHR systems, secure data backup and HIPAA/GDPR compliance for clinics and hospitals.",
    solutionsSq: ["Rrjete VLAN dedikuara", "Backup i sigurt GDPR", "Sisteme VoIP klinikë", "Remote monitoring"],
    solutionsEn: ["Dedicated VLAN networks", "GDPR-compliant secure backup", "Clinic VoIP systems", "Remote monitoring"],
    clientsSq: "30+ klinika dhe spitale",
    clientsEn: "30+ clinics and hospitals",
  },
  {
    icon: GraduationCap,
    color: "bg-violet-50 text-violet-600 border-violet-100",
    accent: "from-violet-600 to-purple-700",
    nameSq: "Arsim & Universitete",
    nameEn: "Education & Universities",
    descSq: "Rrjet WiFi kampus, laboratore kompjuterike, Microsoft 365 Education dhe sisteme sigurie për institucionet arsimore.",
    descEn: "Campus WiFi network, computer labs, Microsoft 365 Education and security systems for educational institutions.",
    solutionsSq: ["WiFi kampus i mbuluar", "Laboratore kompjuterike", "Microsoft 365 Education", "CCTV & kontroll aksesi"],
    solutionsEn: ["Full-coverage campus WiFi", "Computer laboratories", "Microsoft 365 Education", "CCTV & access control"],
    clientsSq: "15+ shkolla dhe universitete",
    clientsEn: "15+ schools and universities",
  },
  {
    icon: Utensils,
    color: "bg-amber-50 text-amber-600 border-amber-100",
    accent: "from-amber-500 to-orange-600",
    nameSq: "HoReCa & Turizëm",
    nameEn: "HoReCa & Tourism",
    descSq: "Sisteme WiFi hoteli, PMS integrim, IPTV dhe CCTV për hotele, restorante dhe komplekse turistike.",
    descEn: "Hotel WiFi systems, PMS integration, IPTV and CCTV for hotels, restaurants and tourist complexes.",
    solutionsSq: ["WiFi Hotel me guest portal", "Sisteme IPTV", "PMS integrim", "CCTV & kyçje digjitale"],
    solutionsEn: ["Hotel WiFi with guest portal", "IPTV systems", "PMS integration", "CCTV & digital locks"],
    clientsSq: "25+ hotele dhe restorante",
    clientsEn: "25+ hotels and restaurants",
  },
  {
    icon: Building2,
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    accent: "from-indigo-500 to-blue-700",
    nameSq: "Ndërtim & Real Estate",
    nameEn: "Construction & Real Estate",
    descSq: "Menaxhim projekti IT, BMS (Building Management Systems), kontroll aksesi dhe sisteme sigurie për komplekset rezidenciale dhe komerciale.",
    descEn: "IT project management, BMS (Building Management Systems), access control and security for residential and commercial complexes.",
    solutionsSq: ["Sisteme BMS", "Kontroll aksesi & intercom", "CCTV kompleks", "IT infrastrukturë kantier"],
    solutionsEn: ["BMS systems", "Access control & intercom", "Complex CCTV", "Construction site IT infrastructure"],
    clientsSq: "20+ projekte ndërtimi",
    clientsEn: "20+ construction projects",
  },
  {
    icon: Truck,
    color: "bg-teal-50 text-teal-600 border-teal-100",
    accent: "from-teal-500 to-emerald-600",
    nameSq: "Logjistikë & Transport",
    nameEn: "Logistics & Transport",
    descSq: "GPS tracking, softuer menaxhimi flotash, rrjete WAN multi-lokacion dhe mbështetje IT për kompanitë e transportit.",
    descEn: "GPS tracking, fleet management software, multi-location WAN networks, and IT support for transport companies.",
    solutionsSq: ["GPS Fleet Tracking", "Menaxhim flotash", "WAN multi-lokacion", "Backup & monitorim rrjeti"],
    solutionsEn: ["GPS Fleet Tracking", "Fleet management", "Multi-location WAN", "Backup & network monitoring"],
    clientsSq: "15+ kompani logjistike",
    clientsEn: "15+ logistics companies",
  },
  {
    icon: Factory,
    color: "bg-slate-50 text-slate-600 border-slate-200",
    accent: "from-slate-600 to-gray-700",
    nameSq: "Prodhim & Industri",
    nameEn: "Manufacturing & Industry",
    descSq: "Rrjete industriale, SCADA integrim, siguri OT/IT dhe sisteme monitorimi për fabrikat dhe impjantet industriale.",
    descEn: "Industrial networks, SCADA integration, OT/IT security and monitoring systems for factories and industrial plants.",
    solutionsSq: ["Rrjete industriale", "SCADA/HMI integrim", "Siguri OT (Operational Technology)", "Kamera termovizonike"],
    solutionsEn: ["Industrial networks", "SCADA/HMI integration", "OT (Operational Technology) security", "Thermovision cameras"],
    clientsSq: "10+ fabrika dhe impjante",
    clientsEn: "10+ factories and plants",
  },
];

export default async function IndustritePage({
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
          <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[200px] w-[200px] rounded-full bg-amber-500/10 blur-3xl" />
        </div>
        <div className="container relative mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-5 py-2 text-sm text-white/70 mb-6">
            <Building2 className="h-4 w-4 text-amber-400" />
            {locale === "sq" ? "8 Sektore Industrie" : "8 Industry Sectors"}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-5 leading-tight">
            {locale === "sq" ? "Zgjidhje IT për Çdo Industri" : "IT Solutions for Every Industry"}
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            {locale === "sq"
              ? "Kuptojmë specifikat e secilit sektor. Ofrojmë zgjidhje të personalizuara, jo produkte generike."
              : "We understand the specifics of each sector. We offer customized solutions, not generic products."}
          </p>
        </div>
      </section>

      {/* Industries grid */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {industries.map((ind) => {
              const Icon = ind.icon;
              const name = locale === "sq" ? ind.nameSq : ind.nameEn;
              const desc = locale === "sq" ? ind.descSq : ind.descEn;
              const solutions = locale === "sq" ? ind.solutionsSq : ind.solutionsEn;
              const clients = locale === "sq" ? ind.clientsSq : ind.clientsEn;
              return (
                <div key={name} className="rounded-2xl bg-white border border-border/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className={`h-1.5 w-full bg-gradient-to-r ${ind.accent}`} />
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${ind.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-lg">{name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{clients}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{desc}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {solutions.map((s) => (
                        <div key={s} className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className="text-xs">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold mb-4">
            {locale === "sq" ? "Industria Juaj nuk është këtu?" : "Your industry not listed?"}
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            {locale === "sq"
              ? "Punojmë me çdo lloj biznesi. Kontaktoni dhe diskutojmë zgjidhjen e duhur."
              : "We work with any type of business. Contact us and let's discuss the right solution."}
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
