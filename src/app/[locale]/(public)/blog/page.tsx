import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, Tag } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { SeoLocale } from "@/lib/seo/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale: (locale === "en" ? "en" : "sq") as SeoLocale,
    page: "blog",
    ogType: "website",
  });
}

const articles = [
  {
    slug: "wifi-6-bizneset-shqiptare",
    coverImg: "https://picsum.photos/seed/wifi6-blog/800/450",
    tagSq: "Rrjetëzim",
    tagEn: "Networking",
    tagColor: "bg-emerald-100 text-emerald-700",
    readMin: 5,
    dateSq: "10 Maj 2026",
    dateEn: "May 10, 2026",
    titleSq: "WiFi 6: A Ia Vlen Investimi për Bizneset Shqiptare?",
    titleEn: "WiFi 6: Is the Investment Worth It for Albanian Businesses?",
    excerptSq: "WiFi 6 (802.11ax) premton shpejtësi deri 4× më të larta dhe latencë të reduktuar. Analizojmë kur ia vlen migrimi dhe kur jo.",
    excerptEn: "WiFi 6 (802.11ax) promises speeds up to 4× higher and reduced latency. We analyze when migration is worth it and when it isn't.",
  },
  {
    slug: "microsoft-365-copilot-shqiperi",
    coverImg: "https://picsum.photos/seed/copilot-m365/800/450",
    tagSq: "Cloud",
    tagEn: "Cloud",
    tagColor: "bg-blue-100 text-blue-700",
    readMin: 7,
    dateSq: "5 Maj 2026",
    dateEn: "May 5, 2026",
    titleSq: "Microsoft 365 Copilot: Çfarë Ndryshon për Biznesin Tuaj?",
    titleEn: "Microsoft 365 Copilot: What Changes for Your Business?",
    excerptSq: "AI i integruar në Word, Excel dhe Teams tashmë është realitet. Si mund ta adoptojnë bizneset shqiptare AI-n e Microsoft-it?",
    excerptEn: "AI integrated into Word, Excel and Teams is now a reality. How can Albanian businesses adopt Microsoft's AI tools?",
  },
  {
    slug: "ransomware-mbrojtja-2025",
    coverImg: "https://picsum.photos/seed/ransomware-protect/800/450",
    tagSq: "Praktika IT",
    tagEn: "IT Best Practices",
    tagColor: "bg-red-100 text-red-700",
    readMin: 8,
    dateSq: "28 Prill 2026",
    dateEn: "April 28, 2026",
    titleSq: "5 Mënyra për t'u Mbrojtur nga Ransomware në 2026",
    titleEn: "5 Ways to Protect Yourself from Ransomware in 2026",
    excerptSq: "Sulmet ransomware janë rritur 300% gjatë 3 viteve të fundit. Ja çfarë duhet të bëjë çdo biznes shqiptar tani.",
    excerptEn: "Ransomware attacks have increased 300% over the past 3 years. Here's what every Albanian business should do now.",
  },
  {
    slug: "server-cloud-vs-lokal",
    coverImg: "https://picsum.photos/seed/cloud-vs-server/800/450",
    tagSq: "Cloud",
    tagEn: "Cloud",
    tagColor: "bg-blue-100 text-blue-700",
    readMin: 6,
    dateSq: "20 Prill 2026",
    dateEn: "April 20, 2026",
    titleSq: "Server Lokal vs Cloud: Cili është Zgjidhja e Duhur?",
    titleEn: "Local Server vs Cloud: Which is the Right Choice?",
    excerptSq: "Krahasojmë kostot, performancën dhe sigurinë e serverëve lokalë kundrejt cloud-it — me numra reale.",
    excerptEn: "We compare costs, performance and security of local servers vs cloud — with real numbers.",
  },
  {
    slug: "cctv-ai-bizneset",
    coverImg: "https://picsum.photos/seed/cctv-ai-blog/800/450",
    tagSq: "CCTV & Siguri",
    tagEn: "CCTV & Security",
    tagColor: "bg-rose-100 text-rose-700",
    readMin: 5,
    dateSq: "10 Prill 2026",
    dateEn: "April 10, 2026",
    titleSq: "CCTV me AI: Detektimi i Personave dhe Automjeteve",
    titleEn: "AI CCTV: Person and Vehicle Detection",
    excerptSq: "Kamerat e reja AI nga Hikvision dhe Dahua dallojnë persona nga kafshë dhe automjete. A ia vlen dhe çfarë duhet të dini.",
    excerptEn: "New AI cameras from Hikvision and Dahua can distinguish people from animals and vehicles. Is it worth it and what you need to know.",
  },
  {
    slug: "outsourcing-it-vs-staf-i-brendshem",
    coverImg: "https://picsum.photos/seed/outsource-it/800/450",
    tagSq: "IT Support",
    tagEn: "IT Support",
    tagColor: "bg-violet-100 text-violet-700",
    readMin: 6,
    dateSq: "1 Prill 2026",
    dateEn: "April 1, 2026",
    titleSq: "IT Outsourcing vs Staf i Brendshëm: Analiza e Kostove",
    titleEn: "IT Outsourcing vs In-house Staff: Cost Analysis",
    excerptSq: "Llogarisim kostot reale të të dy modeleve për bizneset shqiptare: paga, sigurime, hardware, trajnim dhe koha humbur.",
    excerptEn: "We calculate the real costs of both models for Albanian businesses: salaries, insurance, hardware, training and lost time.",
  },
];

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lp = locale === "sq" ? "" : `/${locale}`;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-[hsl(222,47%,9%)] text-white py-16 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-primary/15 blur-3xl" />
        </div>
        <div className="container relative mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Blog & Insights</h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            {locale === "sq"
              ? "Artikuj dhe analiza mbi teknologjitë e reja, sigurinë dhe transformimin dixhital."
              : "Articles and analysis on new technologies, security and digital transformation."}
          </p>
        </div>
      </section>

      {/* Articles */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <Link
                key={art.slug}
                href={`${lp}/blog/${art.slug}`}
                className="group block"
              >
                <article className="h-full rounded-2xl bg-white border border-border/60 overflow-hidden hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1">
                  {/* Cover */}
                  <div className="aspect-video bg-slate-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={art.coverImg}
                      alt={locale === "sq" ? art.titleSq : art.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${art.tagColor}`}>
                        <Tag className="h-2.5 w-2.5" />
                        {locale === "sq" ? art.tagSq : art.tagEn}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-2.5 w-2.5" />
                        {art.readMin} min
                      </span>
                    </div>
                    <h2 className="font-extrabold text-base leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {locale === "sq" ? art.titleSq : art.titleEn}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                      {locale === "sq" ? art.excerptSq : art.excerptEn}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{locale === "sq" ? art.dateSq : art.dateEn}</span>
                      <span className="flex items-center gap-1 text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        {locale === "sq" ? "Lexo" : "Read"}
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
