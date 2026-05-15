import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Phone, Mail, MapPin, Clock, Shield, Award, ArrowUpRight } from "lucide-react";
import { ItArenaLogo } from "@/components/brand/logo";
import { shopUrl } from "@/lib/shop-url";

export function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const localePath = locale === "sq" ? "" : `/${locale}`;

  const navLink = (href: string) => `${localePath}${href}`;

  const serviceLinks = [
    { key: "it_support", href: "/sherbime/it-support" },
    { key: "cloud", href: "/sherbime/cloud" },
    { key: "telecom", href: "/sherbime/telekomunikacion" },
    { key: "network", href: "/sherbime/rrjet" },
    { key: "web", href: "/sherbime/web-marketing" },
  ];

  return (
    <footer className="bg-[hsl(222,47%,9%)] text-slate-300">
      {/* Main footer grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="mb-5">
              <ItArenaLogo variant="dark" size="lg" showTagline />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              {locale === "sq"
                ? "Partneri juaj strategjik teknologjik në Shqipëri. Nga 2012, duke fuqizuar mbi 500 biznese me zgjidhje IT të personalizuara."
                : "Your strategic technology partner in Albania. Since 2012, empowering 500+ businesses with tailored IT solutions."}
            </p>
            {/* ISO badges */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                <Shield className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-semibold text-slate-200">ISO 9001:2015 Certified</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                <Award className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-200">ISO 27001:2022 Certified</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-white mb-5 text-sm uppercase tracking-widest">
              {t("nav.services")}
            </h3>
            <ul className="space-y-3">
              {serviceLinks.map((s) => (
                <li key={s.key}>
                  <Link
                    href={navLink(s.href)}
                    className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors group"
                  >
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    {t(`services.${s.key}.name`)}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={navLink("/sherbime")}
                  className="text-sm text-primary hover:text-blue-300 transition-colors font-medium"
                >
                  {locale === "sq" ? "Shiko të gjitha →" : "View all →"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-white mb-5 text-sm uppercase tracking-widest">
              {locale === "sq" ? "Kompania" : "Company"}
            </h3>
            <ul className="space-y-3">
              {[
                { label: t("nav.about"), href: "/rreth-nesh" },
                { label: t("nav.partners"), href: "/partneret" },
                { label: t("nav.blog"), href: "/blog" },
                { label: t("nav.contact"), href: "/kontakt" },
                { label: "IT Shop", href: shopUrl(), external: true },
              ].map((item) => (
                <li key={item.label}>
                  {"external" in item && item.external ? (
                    <Link
                      href={item.href}
                      className="flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 transition-colors font-medium"
                    >
                      <ArrowUpRight className="h-3 w-3" />
                      {item.label}
                    </Link>
                  ) : (
                    <Link
                      href={navLink(item.href)}
                      className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors group"
                    >
                      <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white mb-5 text-sm uppercase tracking-widest">
              {t("nav.contact")}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/20">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="space-y-1">
                  <a href="tel:+355696314319" className="hover:text-white transition-colors block font-medium">
                    +355 69 63 14 319
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-500/20">
                  <Mail className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <a href="mailto:info@itarena.al" className="hover:text-white transition-colors">
                  info@itarena.al
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-500/20">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <span>Rr. Loni Ligori, Astir<br />Tiranë, Shqipëri</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-violet-500/20">
                  <Clock className="h-3.5 w-3.5 text-violet-400" />
                </div>
                <div>
                  <div>E Hënë–E Premte: 08:00–17:30</div>
                  <div>E Shtunë: 08:00–13:00</div>
                  <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-emerald-400 font-semibold text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    24/7 Emergjencë
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} IT Arena SH.P.K. · NIPT M11905015A · {t("footer.rights")}.</p>
          <div className="flex items-center gap-5">
            <Link href={navLink("/privatesia")} className="hover:text-slate-300 transition-colors">
              {t("footer.privacy")}
            </Link>
            <Link href={navLink("/kushtet")} className="hover:text-slate-300 transition-colors">
              {t("footer.terms")}
            </Link>
            <span className="text-slate-700">·</span>
            <span className="text-slate-600">Designed in Albania</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
