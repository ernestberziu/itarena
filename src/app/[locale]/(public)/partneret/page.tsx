import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "sq" ? "Partnerët Tanë — IT Arena" : "Our Partners — IT Arena",
    description:
      locale === "sq"
        ? "IT Arena bashkëpunon me markat kryesore botërore të teknologjisë: Microsoft, Cisco, Ubiquiti, Hikvision dhe shumë të tjerë."
        : "IT Arena partners with the world's leading technology brands: Microsoft, Cisco, Ubiquiti, Hikvision and many more.",
  };
}

const partners = [
  {
    name: "Microsoft",
    tier: "Gold Partner",
    tierColor: "bg-yellow-100 text-yellow-700 border-yellow-200",
    logoColor: "bg-blue-600",
    initial: "M",
    descSq: "Partner Gold i çertifikuar për Microsoft 365, Azure dhe Dynamics 365. Kemi 8+ çertifikime aktive Microsoft.",
    descEn: "Certified Gold Partner for Microsoft 365, Azure and Dynamics 365. We hold 8+ active Microsoft certifications.",
  },
  {
    name: "Cisco",
    tier: "Certified Partner",
    tierColor: "bg-blue-100 text-blue-700 border-blue-200",
    logoColor: "bg-blue-700",
    initial: "C",
    descSq: "Partner i çertifikuar Cisco me inxhinierë CCNA dhe CCNP. Ofrojmë produkte dhe zgjidhje rrjeti Cisco.",
    descEn: "Certified Cisco partner with CCNA and CCNP engineers. We offer Cisco networking products and solutions.",
  },
  {
    name: "Ubiquiti",
    tier: "Elite Partner",
    tierColor: "bg-orange-100 text-orange-700 border-orange-200",
    logoColor: "bg-orange-500",
    initial: "U",
    descSq: "Partner Elite Ubiquiti — specializuar në sistemet UniFi dhe EdgeMAX. Instalime wireless të çertifikuara.",
    descEn: "Elite Ubiquiti partner — specialized in UniFi and EdgeMAX systems. Certified wireless installations.",
  },
  {
    name: "Hikvision",
    tier: "Authorized Partner",
    tierColor: "bg-red-100 text-red-700 border-red-200",
    logoColor: "bg-red-600",
    initial: "H",
    descSq: "Partner i autorizuar Hikvision për kamerat CCTV, sisteme NVR/DVR dhe teknologjitë AcuSense AI.",
    descEn: "Authorized Hikvision partner for CCTV cameras, NVR/DVR systems and AcuSense AI technologies.",
  },
  {
    name: "HP",
    tier: "Reseller Partner",
    tierColor: "bg-slate-100 text-slate-700 border-slate-200",
    logoColor: "bg-blue-500",
    initial: "HP",
    descSq: "Reseller i autorizuar HP për printerë, kompjuterë dhe serverë HP ProLiant.",
    descEn: "Authorized HP reseller for printers, computers and HP ProLiant servers.",
  },
  {
    name: "Dell Technologies",
    tier: "Reseller Partner",
    tierColor: "bg-slate-100 text-slate-700 border-slate-200",
    logoColor: "bg-blue-800",
    initial: "DT",
    descSq: "Partner Dell Technologies për serverë PowerEdge, workstations Precision dhe storage PowerVault.",
    descEn: "Dell Technologies partner for PowerEdge servers, Precision workstations and PowerVault storage.",
  },
  {
    name: "Fortinet",
    tier: "Authorized Partner",
    tierColor: "bg-red-100 text-red-700 border-red-200",
    logoColor: "bg-red-700",
    initial: "FN",
    descSq: "Partner i autorizuar Fortinet për FortiGate Firewall, FortiAP dhe rrjete të sigurta multi-lokacion.",
    descEn: "Authorized Fortinet partner for FortiGate Firewall, FortiAP, and secure multi-site networking.",
  },
  {
    name: "Lenovo",
    tier: "Reseller Partner",
    tierColor: "bg-slate-100 text-slate-700 border-slate-200",
    logoColor: "bg-gray-800",
    initial: "LN",
    descSq: "Partner Lenovo për laptopë ThinkPad, kompjuterë ThinkCentre dhe serverë ThinkSystem.",
    descEn: "Lenovo partner for ThinkPad laptops, ThinkCentre computers and ThinkSystem servers.",
  },
];

const certifications = [
  "Microsoft Certified: Azure Solutions Architect",
  "Microsoft Certified: Modern Desktop Administrator",
  "Cisco CCNA (Cisco Certified Network Associate)",
  "Cisco CCNP Enterprise",
  "Ubiquiti UEWA (UniFi Enterprise Wireless Admin)",
  "CompTIA Security+",
  "ISO 9001:2015 Çertifikim",
  "ISO 27001:2022 Çertifikim",
];

export default async function PartnetetPage({
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
        </div>
        <div className="container relative mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            {locale === "sq" ? "Partnerët & Çertifikimet" : "Partners & Certifications"}
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            {locale === "sq"
              ? "Punojmë me markat kryesore botërore për t'ju sjellë teknologji të çertifikuar me garanci."
              : "We work with the world's leading brands to bring you certified technology with guarantees."}
          </p>
        </div>
      </section>

      {/* Partners */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-center mb-12">
            {locale === "sq" ? "Partnerët Teknologjikë" : "Technology Partners"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {partners.map((p) => (
              <div key={p.name} className="rounded-2xl bg-white border border-border/60 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${p.logoColor} text-white font-extrabold text-sm`}>
                    {p.initial}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{p.name}</h3>
                    <span className={`inline-block mt-0.5 rounded-full border px-2 py-0.5 text-[10px] font-bold ${p.tierColor}`}>
                      {p.tier}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {locale === "sq" ? p.descSq : p.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 bg-white border-t">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-center mb-10">
            {locale === "sq" ? "Çertifikimet e Ekipit" : "Team Certifications"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {certifications.map((cert) => (
              <div key={cert} className="flex items-start gap-2 rounded-xl border border-border/60 bg-slate-50 p-4">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-extrabold mb-4">
            {locale === "sq" ? "Bëhuni Partner i IT Arena" : "Become an IT Arena Partner"}
          </h2>
          <p className="text-white/70 mb-7 max-w-md mx-auto text-sm">
            {locale === "sq"
              ? "Jeni rishitës ose konsulent IT? Flisni me ne për mundësi partneriteti."
              : "Are you an IT reseller or consultant? Talk to us about partnership opportunities."}
          </p>
          <Button asChild size="lg" variant="accent">
            <Link href={`${lp}/kontakt`}>
              {locale === "sq" ? "Na Kontaktoni" : "Contact Us"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
