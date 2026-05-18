import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedSiteContent } from "@/lib/site-content/db";
import { getLucideIcon } from "@/lib/site-content/icons";
import { pickLocale, serviceName, serviceShortDesc, serviceFeatures } from "@/lib/site-content/locale";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const content = await getPublishedSiteContent();
  return {
    title: pickLocale(content.settings.seo.defaultTitle, locale),
    description: pickLocale(content.settings.seo.defaultDescription, locale),
  };
}

export default async function SherbimePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const content = await getPublishedSiteContent();
  const lp = locale === "sq" ? "" : `/${locale}`;
  const services = content.services.filter((s) => s.enabled);

  return (
    <div className="flex flex-col">
      <section className="mesh-gradient py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            {locale === "sq" ? "Shërbimet Tona" : "Our Services"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {locale === "sq"
              ? "Zgjidhje teknologjike të plota për biznesin tuaj"
              : "Complete technology solutions for your business"}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 space-y-8">
          {services.map((svc) => {
            const Icon = getLucideIcon(svc.iconKey);
            const features = serviceFeatures(svc, locale);
            return (
              <div
                key={svc.id}
                className={cn(
                  "grid gap-8 rounded-2xl border bg-white p-6 md:grid-cols-[1fr_2fr] md:p-8",
                  "hover:shadow-lg transition-shadow"
                )}
              >
                <div>
                  <div className={cn("mb-4 inline-flex rounded-xl border p-3", svc.colorClass ?? "")}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{serviceName(svc, locale)}</h2>
                  <p className="text-muted-foreground mb-4">{serviceShortDesc(svc, locale)}</p>
                  <Button asChild>
                    <Link href={`${lp}/sherbime/${svc.slug}`}>
                      {locale === "sq" ? "Mëso më shumë" : "Learn more"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
