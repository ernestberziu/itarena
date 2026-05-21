"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Globe,
  Menu,
  X,
  Search,
  Phone,
  LayoutDashboard,
  LogIn,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "./cart-context";
import { ItArenaLogo } from "@/components/brand/logo";
import {
  mainSiteUrl,
  shopSwitchLocaleHref,
  mainSiteHostname,
} from "@/lib/shop-url";
import { useShopPath } from "@/hooks/use-shop-locale";

interface ShopNavbarProps {
  lang: "sq" | "en";
  isLoggedIn: boolean;
  isB2b: boolean;
  mainDashboardPath?: string;
  userDisplayName?: string | null;
}

export function ShopNavbar({
  lang,
  isLoggedIn,
  isB2b,
  mainDashboardPath = "portal/dashboard",
  userDisplayName,
}: ShopNavbarProps) {
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname() ?? "";
  const otherLang = lang === "sq" ? "en" : "sq";
  const shopHome = useShopPath();
  const shopCart = useShopPath("cart");

  const t = {
    sq: {
      home: "Kryefaqja",
      login: "Hyr",
      cart: "Shporta",
      search: "Kërko produkte...",
      b2b: "Çmimet B2B",
      dashboard: "Portali Im",
      dashboardStaff: "Administratori",
      account: "Llogaria",
      mainSite: "Faqja kryesore",
      language: "Gjuha",
      delivery: "Dorëzim 24–48 orë",
    },
    en: {
      home: "Home",
      login: "Login",
      cart: "Cart",
      search: "Search products...",
      b2b: "B2B Prices",
      dashboard: "My Portal",
      dashboardStaff: "Admin",
      account: "Account",
      mainSite: "Main website",
      language: "Language",
      delivery: "Delivery 24–48h",
    },
  }[lang];

  const dashboardHref = mainSiteUrl(mainDashboardPath, lang);
  const dashboardFallback =
    mainDashboardPath.startsWith("admin") ? t.dashboardStaff : t.dashboard;
  const dashboardLabel = userDisplayName ?? dashboardFallback;

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[hsl(222,47%,9%)] text-white shadow-2xl pt-[env(safe-area-inset-top,0px)]">
      {/* Desktop top bar */}
      <div className="hidden border-b border-white/10 py-1.5 md:block">
        <div className="container mx-auto flex items-center justify-between px-4 text-xs text-white/50">
          <div className="flex items-center gap-4">
            <a
              href="tel:+355696314319"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone className="h-3 w-3" />
              +355 69 63 14 319
            </a>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-medium">{t.delivery}</span>
          </div>
          <Link href={mainSiteUrl("", lang)} className="hover:text-white transition-colors">
            {mainSiteHostname()}
          </Link>
        </div>
      </div>

      {/* Main row */}
      <div className="container mx-auto flex h-14 items-center justify-between gap-3 px-3 md:h-16 md:gap-4 md:px-4">
        <Link href={shopHome} className="flex min-w-0 shrink-0 items-center gap-1.5 group">
          <ItArenaLogo variant="dark" size="sm" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 border border-amber-400/40 rounded px-1.5 py-0.5">
            SHOP
          </span>
        </Link>

        <div className="hidden md:flex flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              type="search"
              placeholder={t.search}
              className="w-full rounded-xl border border-white/15 bg-white/10 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href={shopSwitchLocaleHref(pathname, otherLang)}
            className="flex items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide text-white/50 transition-all hover:border-white/15 hover:bg-white/10 hover:text-white"
          >
            <Globe className="h-3.5 w-3.5" />
            {otherLang === "en" ? "EN" : "SQ"}
          </Link>

          {isB2b && (
            <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400">
              B2B
            </span>
          )}

          {isLoggedIn ? (
            <Link
              href={dashboardHref}
              className="inline-flex max-w-[11rem] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              title={dashboardLabel}
            >
              <span className="truncate">{dashboardLabel}</span>
            </Link>
          ) : (
            <Button variant="accent" size="sm" asChild>
              <Link href={mainSiteUrl("hyr", lang)}>{t.login}</Link>
            </Button>
          )}

          <Button asChild className="px-4 text-sm font-bold">
            <Link href={shopCart}>
              <ShoppingCart className="h-4 w-4" />
              {t.cart}
              {totalItems > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-xs font-extrabold text-slate-950">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>
          </Button>
        </div>

        {/* Mobile: cart + menu only */}
        <div className="flex items-center gap-1 md:hidden">
          <Link
            href={shopCart}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/15 active:scale-[0.98]"
            aria-label={`${t.cart}${totalItems > 0 ? ` (${totalItems})` : ""}`}
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-extrabold text-slate-950">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 cursor-pointer select-none items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/15 active:scale-[0.98]"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[hsl(222,47%,9%)] md:hidden">
          <div className="container mx-auto max-h-[min(70vh,28rem)] space-y-4 overflow-y-auto overscroll-y-contain px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {/* Account / login */}
            {isLoggedIn ? (
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/30 text-sm font-bold text-white">
                  {dashboardLabel.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-white/45">
                    {t.account}
                  </p>
                  <p className="truncate text-sm font-semibold text-white">{dashboardLabel}</p>
                </div>
                <Button variant="accent" size="sm" asChild className="shrink-0">
                  <Link href={dashboardHref} onClick={closeMobile}>
                    <LayoutDashboard className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <Button variant="accent" className="w-full" asChild>
                <Link href={mainSiteUrl("hyr", lang)} onClick={closeMobile}>
                  <LogIn className="mr-2 h-4 w-4" />
                  {t.login}
                </Link>
              </Button>
            )}

            {isB2b && (
              <p className="text-center text-xs font-bold text-amber-400">{t.b2b}</p>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                type="search"
                placeholder={t.search}
                className="w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={shopSwitchLocaleHref(pathname, otherLang)}
                onClick={closeMobile}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center transition-colors hover:bg-white/10"
              >
                <Globe className="h-5 w-5 text-white/70" />
                <span className="text-[11px] font-semibold text-white/80">{t.language}</span>
                <span className="text-xs font-bold text-amber-400">
                  {otherLang === "en" ? "English" : "Shqip"}
                </span>
              </Link>
              <Link
                href={shopCart}
                onClick={closeMobile}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center transition-colors hover:bg-white/10"
              >
                <span className="relative">
                  <ShoppingCart className="h-5 w-5 text-white/70" />
                  {totalItems > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-extrabold text-slate-950">
                      {totalItems > 9 ? "9+" : totalItems}
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-semibold text-white/80">{t.cart}</span>
              </Link>
              <Link
                href={mainSiteUrl("", lang)}
                onClick={closeMobile}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center transition-colors hover:bg-white/10"
              >
                <ExternalLink className="h-5 w-5 text-white/70" />
                <span className="text-[11px] font-semibold leading-tight text-white/80">
                  {t.mainSite}
                </span>
                <span className="text-[10px] text-white/45">{mainSiteHostname()}</span>
              </Link>
              <Link
                href={shopHome}
                onClick={closeMobile}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center transition-colors hover:bg-white/10"
              >
                <span className="text-lg font-extrabold text-amber-400">IT</span>
                <span className="text-[11px] font-semibold text-white/80">{t.home}</span>
              </Link>
            </div>

            {/* Contact strip */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-xs">
              <a
                href="tel:+355696314319"
                className="inline-flex items-center gap-1.5 font-medium text-emerald-300"
              >
                <Phone className="h-3.5 w-3.5" />
                +355 69 63 14 319
              </a>
              <span className="text-emerald-400/80">·</span>
              <span className="text-emerald-300">{t.delivery}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
