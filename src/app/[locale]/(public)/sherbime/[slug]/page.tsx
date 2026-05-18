import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getMarketingServiceBySlug,
  listMarketingServices,
} from "@/lib/site-content/db";
import { getLucideIcon } from "@/lib/site-content/icons";
import {
  pickLocale,
  serviceFeatures,
  serviceName,
  serviceShortDesc,
} from "@/lib/site-content/locale";
import { DEFAULT_MARKETING_SERVICES } from "@/lib/site-content/defaults";

const PRINTER_SLUG = "printere" as const;
const LEGACY_PRINTER_SLUG = "printerë";

function resolveServiceSlug(slug: string): string {
  if (slug.normalize("NFC") === LEGACY_PRINTER_SLUG.normalize("NFC")) {
    return PRINTER_SLUG;
  }
  return slug;
}

export async function generateStaticParams() {
  if (!process.env.DATABASE_URL?.trim()) {
    return DEFAULT_MARKETING_SERVICES.map((s) => ({ slug: s.slug }));
  }
  try {
    const services = await listMarketingServices(false);
    if (services.length > 0) {
      return services.map((s) => ({ slug: s.slug }));
    }
  } catch {
    /* build without DB — fall through to defaults */
  }
  return DEFAULT_MARKETING_SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolved = resolveServiceSlug(slug);
  const svc = await getMarketingServiceBySlug(resolved);
  if (!svc) return { title: "IT Arena" };
  const title =
    (locale === "en" ? svc.metaTitleEn : svc.metaTitleSq) || serviceName(svc, locale);
  const description =
    (locale === "en" ? svc.metaDescEn : svc.metaDescSq) || serviceShortDesc(svc, locale);
  return { title, description };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const resolved = resolveServiceSlug(slug);
  if (resolved !== slug) {
    redirect(locale === "sq" ? `/sherbime/${resolved}` : `/${locale}/sherbime/${resolved}`);
  }

  const svc = await getMarketingServiceBySlug(resolved);
  if (!svc) notFound();

  const lp = locale === "sq" ? "" : `/${locale}`;
  const Icon = getLucideIcon(svc.iconKey);
  const features = serviceFeatures(svc, locale);
  const fullDesc =
    (locale === "en" ? svc.fullDescEn : svc.fullDescSq) || serviceShortDesc(svc, locale);

  return (
    <div className="flex flex-col">
      <section
        className={cn(
          "relative overflow-hidden py-20 md:py-28 text-white",
          "bg-gradient-to-br",
          svc.accentClass ?? "from-primary to-blue-700"
        )}
      >
        <div className="container relative mx-auto px-4">
          <div className={cn("mb-6 inline-flex rounded-2xl border border-white/20 bg-white/10 p-4")}>
            <Icon className="h-10 w-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{serviceName(svc, locale)}</h1>
          <p className="text-lg text-white/85 max-w-2xl">{serviceShortDesc(svc, locale)}</p>
          <Button className="mt-8" variant="secondary" asChild>
            <Link href={`${lp}/kerko-oferte`}>
              {locale === "sq" ? "Kërko ofertë" : "Get a quote"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-lg text-muted-foreground leading-relaxed mb-10 whitespace-pre-line">
            {fullDesc}
          </p>
          <h2 className="text-2xl font-bold mb-6">
            {locale === "sq" ? "Çfarë përfshin" : "What's included"}
          </h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
