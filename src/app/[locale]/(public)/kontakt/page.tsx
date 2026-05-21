import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Phone, Mail, MapPin, Clock, MessageSquare, Zap, Shield } from "lucide-react";
import { ContactForm } from "@/components/public/contact-form";
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
    page: "contact",
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-[hsl(222,47%,9%)] text-white py-20 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-1/4 h-[400px] w-[400px] rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[200px] w-[200px] rounded-full bg-amber-500/10 blur-3xl" />
        </div>
        <div className="container relative mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-5 py-2 text-sm text-white/70 mb-6">
            <MessageSquare className="h-4 w-4" />
            {locale === "sq" ? "Jemi këtu për ju" : "We are here for you"}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-5">{t("title")}</h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">{t("subtitle")}</p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* Contact info — left */}
            <div className="lg:col-span-2 space-y-4">
              {/* Response time card */}
              <div className="rounded-2xl bg-gradient-to-br from-primary to-blue-700 p-6 text-white shadow-lg shadow-primary/25">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="h-6 w-6" />
                  <span className="font-bold text-lg">
                    {locale === "sq" ? "Reagim i Shpejtë" : "Fast Response"}
                  </span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">
                  {locale === "sq"
                    ? "Ekipi ynë i mbështetjes përgjigjet brenda 1 ore gjatë orarit të punës. Urgjencë? 24/7 jemi aty."
                    : "Our support team responds within 1 hour during working hours. Emergency? We're there 24/7."}
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  {locale === "sq" ? "Online tani" : "Online now"}
                </div>
              </div>

              {/* Contact info cards */}
              {[
                {
                  icon: Phone,
                  color: "bg-blue-50 text-blue-600",
                  title: locale === "sq" ? "Telefon" : "Phone",
                  lines: [
                    { text: "+355 69 63 14 319", href: "tel:+355696314319" },
                  ],
                },
                {
                  icon: Mail,
                  color: "bg-amber-50 text-amber-600",
                  title: "Email",
                  lines: [
                    { text: "info@itarena.al", href: "mailto:info@itarena.al" },
                    { text: "support@itarena.al", href: "mailto:support@itarena.al" },
                  ],
                },
                {
                  icon: MapPin,
                  color: "bg-emerald-50 text-emerald-600",
                  title: locale === "sq" ? "Adresa" : "Address",
                  lines: [
                    { text: "Rr. Loni Ligori, Astir" },
                    { text: "Tiranë, Shqipëri" },
                  ],
                },
                {
                  icon: Clock,
                  color: "bg-violet-50 text-violet-600",
                  title: locale === "sq" ? "Orari i Punës" : "Working Hours",
                  lines: [
                    { text: "E Hënë–E Premte: 08:00–17:30" },
                    { text: "E Shtunë: 08:00–13:00" },
                  ],
                },
              ].map((card) => (
                <div key={card.title} className="rounded-2xl bg-white border border-border/60 p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.color}`}>
                      <card.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm mb-2">{card.title}</p>
                      {card.lines.map((line, i) => (
                        <p key={i} className="text-sm text-muted-foreground">
                          {"href" in line ? (
                            <a href={line.href} className="hover:text-primary transition-colors">
                              {line.text}
                            </a>
                          ) : line.text}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* ISO badge */}
              <div className="rounded-2xl bg-white border border-border/60 p-5 shadow-sm flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary shrink-0" />
                <div>
                  <p className="font-bold text-sm">ISO 9001 &amp; ISO 27001</p>
                  <p className="text-xs text-muted-foreground">
                    {locale === "sq" ? "Të dhënat tuaja janë të sigurta" : "Your data is secure"}
                  </p>
                </div>
              </div>
            </div>

            {/* Form — right */}
            <div className="lg:col-span-3">
              <div className="rounded-3xl bg-white border border-border/60 shadow-xl shadow-slate-200/50 p-8 md:p-10">
                <h2 className="text-2xl font-extrabold mb-2">
                  {locale === "sq" ? "Dërgoni Mesazhin" : "Send a Message"}
                </h2>
                <p className="text-muted-foreground text-sm mb-8">
                  {locale === "sq"
                    ? "Plotësoni formularin dhe do t'ju kontaktojmë brenda 1 ore."
                    : "Fill in the form and we will contact you within 1 hour."}
                </p>
                <ContactForm locale={locale} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency banner */}
      <section className="py-8 bg-red-50 border-y border-red-100">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
              <Phone className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="font-bold text-sm text-red-900">
                {locale === "sq" ? "Emergjencë IT — 24/7" : "IT Emergency — 24/7"}
              </p>
              <p className="text-xs text-red-700">
                {locale === "sq"
                  ? "Jemi gjithmonë të arritshëm për emergjenca teknike"
                  : "We are always available for technical emergencies"}
              </p>
            </div>
          </div>
          <a
            href="tel:+355696314319"
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors shadow-md"
          >
            <Phone className="h-4 w-4" />
            +355 69 63 14 319
          </a>
        </div>
      </section>
    </div>
  );
}
