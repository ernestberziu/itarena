import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CheckCircle2, Clock, Shield, Zap, Building2, ArrowRight } from "lucide-react";
import { QuoteRequestForm, type QuoteRequestPrefill } from "@/components/public/quote-request-form";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PORTAL_ROLES } from "@/lib/portal/access";

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
    page: "quote",
  });
}

export default async function QuoteRequestPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "quotePage" });
  const session = await auth();

  let prefilled: QuoteRequestPrefill | null = null;
  if (session?.user?.id && PORTAL_ROLES.includes(session.user.role as (typeof PORTAL_ROLES)[number])) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        company: { select: { name: true, vatNumber: true } },
      },
    });
    if (user) {
      prefilled = {
        companyName: user.company?.name ?? "",
        vatNumber: user.company?.vatNumber ?? undefined,
        contactName: `${user.firstName} ${user.lastName}`.trim(),
        contactEmail: user.email ?? "",
        contactPhone: user.phone ?? undefined,
      };
    }
  }

  const benefits = [
    { icon: Zap, color: "text-primary bg-primary/10", title: t("benefit1Title"), desc: t("benefit1Desc") },
    { icon: Shield, color: "text-emerald-600 bg-emerald-50", title: t("benefit2Title"), desc: t("benefit2Desc") },
    { icon: CheckCircle2, color: "text-violet-600 bg-violet-50", title: t("benefit3Title"), desc: t("benefit3Desc") },
    { icon: Clock, color: "text-amber-600 bg-amber-50", title: t("benefit4Title"), desc: t("benefit4Desc") },
  ];

  const services = [
    "IT Support & Helpdesk", "Cloud & Microsoft 365", "CCTV & Siguri",
    "Web & Marketing", "Rrjet & Infrastrukturë", "Zhvillim Softuerësh",
    "Telekomunikacion", "Printerë",
  ];

  const processSteps = [t("process1"), t("process2"), t("process3"), t("process4")];

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-blue-700 to-violet-700 py-12 text-white md:py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 h-[400px] w-[400px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-[200px] w-[200px] rounded-full bg-amber-400/10 blur-3xl" />
        </div>
        <div className="container relative mx-auto px-4 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-5 py-2 text-sm text-white/80">
            <Building2 className="h-4 w-4" />
            {t("badge")}
          </div>
          <h1 className="mb-5 text-4xl font-extrabold md:text-5xl">{t("heroTitle")}</h1>
          <p className="mx-auto max-w-2xl text-lg text-white/70">{t("heroSubtitle")}</p>
        </div>
      </section>

      <section className="bg-slate-50 py-10 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-10">
            <div className="space-y-6 lg:col-span-2">
              <div>
                <h2 className="mb-5 text-xl font-extrabold">{t("whyTitle")}</h2>
                <div className="space-y-4">
                  {benefits.map((b) => (
                    <div key={b.title} className="flex items-start gap-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${b.color}`}>
                        <b.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{b.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{b.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
                <p className="mb-4 text-sm font-bold">{t("servicesTitle")}</p>
                <div className="flex flex-wrap gap-2">
                  {services.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
                <p className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-900">
                  <ArrowRight className="h-4 w-4 text-amber-600" />
                  {t("processTitle")}
                </p>
                {processSteps.map((step) => (
                  <p key={step} className="border-b border-amber-100 py-1 text-xs text-amber-800 last:border-0">
                    {step}
                  </p>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:p-8 md:p-10">
                <h2 className="mb-2 text-2xl font-extrabold">{t("formTitle")}</h2>
                <p className="mb-8 text-sm text-muted-foreground">
                  {prefilled ? t("formSubtitlePrefilled") : t("formSubtitleGuest")}
                </p>
                <QuoteRequestForm locale={locale} prefilled={prefilled} locked={Boolean(prefilled)} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
