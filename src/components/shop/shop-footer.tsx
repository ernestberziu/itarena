"use client";

import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ItArenaLogo } from "@/components/brand/logo";
import { mainSiteUrl, shopPath, mainSiteHostname } from "@/lib/shop-url";
import { ShopTrustStrip } from "@/components/shop/shop-trust-strip";

export function ShopFooter() {
  const lang = useLocale() as "sq" | "en";
  const t = useTranslations("shop");
  const tNav = useTranslations("shop.nav");

  return (
    <footer className="bg-[hsl(222,47%,9%)] text-slate-300 mt-auto">
      <div className="border-y border-white/10 bg-[hsl(222,47%,11%)]">
        <div className="container mx-auto px-4">
          <ShopTrustStrip />
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <ItArenaLogo variant="dark" size="md" />
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest border border-amber-400/40 rounded px-1.5 py-0.5">
                {tNav("shopBadge")}
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">{t("description")}</p>
          </div>
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-widest mb-4">
              {t("footerLinksTitle")}
            </h3>
            <ul className="space-y-2.5">
              {[
                { key: "products", label: t("all_products"), href: shopPath(lang, "") },
                { key: "cart", label: tNav("cart"), href: shopPath(lang, "cart") },
                {
                  key: "portal",
                  label: tNav("dashboard"),
                  href: mainSiteUrl("portal/dashboard", lang),
                },
                { key: "main", label: mainSiteHostname(), href: mainSiteUrl("", lang) },
              ].map((l) => (
                <li key={l.key}>
                  <Link href={l.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-widest mb-4">
              {t("footerContactTitle")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                <a href="tel:+355696314319" className="hover:text-white">
                  +355 69 63 14 319
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Mail className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <a href="mailto:info@itarena.al" className="hover:text-white">
                  info@itarena.al
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-400">
                <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{t("footerAddress")}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/8">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <p>
            © {new Date().getFullYear()} IT Arena SH.P.K. {t("footerRights")}
          </p>
          <div className="flex gap-4">
            <Link href={mainSiteUrl("privatesia", lang)} className="hover:text-slate-400 transition-colors">
              {t("footerPrivacy")}
            </Link>
            <Link href={mainSiteUrl("kushtet", lang)} className="hover:text-slate-400 transition-colors">
              {t("footerTerms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
