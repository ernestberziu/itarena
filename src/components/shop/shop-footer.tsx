import Link from "next/link";
import { Phone, Mail, MapPin, Truck, CreditCard, Shield } from "lucide-react";
import { ItArenaLogo } from "@/components/brand/logo";
import { mainSiteUrl, shopUrl } from "@/lib/shop-url";

interface ShopFooterProps {
  lang: "sq" | "en";
}

export function ShopFooter({ lang }: ShopFooterProps) {
  return (
    <footer className="bg-[hsl(222,47%,9%)] text-slate-300 mt-auto">
      {/* Feature strip */}
      <div className="border-y border-white/8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/8 py-6">
            {[
              { icon: Truck, label: lang === "sq" ? "Dorëzim 24–48h" : "24–48h Delivery", desc: lang === "sq" ? "Në të gjithë Shqipërinë" : "Across Albania", color: "text-blue-400" },
              { icon: CreditCard, label: lang === "sq" ? "Pagesë me Dorëzim" : "Cash on Delivery", desc: lang === "sq" ? "Pagoni vetëm kur merrni" : "Pay only when you receive", color: "text-amber-400" },
              { icon: Shield, label: lang === "sq" ? "Garanci Zyrtare" : "Official Warranty", desc: lang === "sq" ? "Produkte origjinale" : "Original products", color: "text-emerald-400" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-4 px-6 py-2">
                <f.icon className={`h-7 w-7 shrink-0 ${f.color}`} />
                <div>
                  <p className="font-bold text-sm text-white">{f.label}</p>
                  <p className="text-xs text-slate-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <ItArenaLogo variant="dark" size="md" />
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest border border-amber-400/40 rounded px-1.5 py-0.5">
                SHOP
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              {lang === "sq"
                ? "Dyqani online zyrtar i IT Arena — hardware, software dhe pajisje periferike me dorëzim në Shqipëri."
                : "The official online store of IT Arena — hardware, software and peripheral devices with delivery across Albania."}
            </p>
          </div>
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-widest mb-4">
              {lang === "sq" ? "Lidhje" : "Links"}
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: lang === "sq" ? "Të gjitha produktet" : "All products", href: shopUrl() },
                { label: lang === "sq" ? "Shporta" : "Cart", href: shopUrl("cart") },
                { label: lang === "sq" ? "Portali im" : "My portal", href: mainSiteUrl("portal/dashboard") },
                { label: "itarena.al", href: mainSiteUrl() },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-widest mb-4">
              {lang === "sq" ? "Kontakt" : "Contact"}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                <a href="tel:+355696314319" className="hover:text-white">+355 69 63 14 319</a>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Mail className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <a href="mailto:info@itarena.al" className="hover:text-white">info@itarena.al</a>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-400">
                <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Rr. Loni Ligori, Astir, Tiranë</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/8">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <p>© {new Date().getFullYear()} IT Arena SH.P.K. {lang === "sq" ? "Të gjitha të drejtat e rezervuara." : "All rights reserved."}</p>
          <div className="flex gap-4">
            <Link href={mainSiteUrl("privatesia")} className="hover:text-slate-400 transition-colors">{lang === "sq" ? "Privatësia" : "Privacy"}</Link>
            <Link href={mainSiteUrl("kushtet")} className="hover:text-slate-400 transition-colors">{lang === "sq" ? "Kushtet" : "Terms"}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
