"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Globe, Menu, X, Search, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "./cart-context";
import { ItArenaLogo } from "@/components/brand/logo";
import { mainSiteUrl, shopUrl, shopUrlWithLang } from "@/lib/shop-url";

interface ShopNavbarProps {
  lang: "sq" | "en";
  isLoggedIn: boolean;
  isB2b: boolean;
  isAdmin: boolean;
  /** Main-site path after login, e.g. `portal/dashboard` or `admin/dashboard`. */
  mainDashboardPath?: string;
}

export function ShopNavbar({
  lang,
  isLoggedIn,
  isB2b,
  isAdmin,
  mainDashboardPath = "portal/dashboard",
}: ShopNavbarProps) {
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const otherLang = lang === "sq" ? "en" : "sq";

  const t = {
    sq: {
      home: "Kryefaqja",
      categories: "Kategoritë",
      deals: "Ofertat",
      about: "Rreth Nesh",
      login: "Hyr",
      cart: "Shporta",
      search: "Kërko produkte...",
      b2b: "Çmimet B2B",
      admin: "Administrim",
      dashboard: "Portali Im",
      dashboardStaff: "Administratori",
    },
    en: {
      home: "Home",
      categories: "Categories",
      deals: "Deals",
      about: "About",
      login: "Login",
      cart: "Cart",
      search: "Search products...",
      b2b: "B2B Prices",
      admin: "Admin",
      dashboard: "My Portal",
      dashboardStaff: "Admin",
    },
  }[lang];

  const dashboardHref = mainSiteUrl(mainDashboardPath);
  const dashboardLabel =
    mainDashboardPath.startsWith("admin") ? t.dashboardStaff : t.dashboard;

  return (
    <header className="sticky top-0 z-50 w-full bg-[hsl(222,47%,9%)] text-white shadow-2xl">
      {/* Top bar */}
      <div className="border-b border-white/10 py-1.5 hidden md:block">
        <div className="container mx-auto flex items-center justify-between px-4 text-xs text-white/50">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3 w-3" />
              +355 69 63 14 319
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
            <span className="text-emerald-400 font-medium">
              {lang === "sq" ? "Dorëzim 24–48 orë" : "Delivery 24–48h"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link
                href={shopUrl("admin/products")}
                className="hover:text-white transition-colors font-medium text-amber-400"
              >
                {t.admin}
              </Link>
            )}
            <Link href={mainSiteUrl()} className="hover:text-white transition-colors">
              itarena.al
            </Link>
          </div>
        </div>
      </div>

      {/* Main row */}
      <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
        {/* Logo */}
        <Link href={shopUrl()} className="flex items-center gap-2 shrink-0 group">
          <ItArenaLogo variant="dark" size="sm" />
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest border border-amber-400/40 rounded px-1.5 py-0.5">
            SHOP
          </span>
        </Link>

        {/* Search bar */}
        <div className="hidden md:flex flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input
              type="search"
              placeholder={t.search}
              className="w-full rounded-xl bg-white/10 border border-white/15 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Lang switcher */}
          <Link
            href={shopUrlWithLang("", otherLang)}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-white/50 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/10 border border-transparent hover:border-white/15 transition-all uppercase tracking-wide"
          >
            <Globe className="h-3.5 w-3.5" />
            {otherLang === "en" ? "EN" : "SQ"}
          </Link>

          {isB2b && (
            <span className="hidden sm:inline-flex items-center rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-400">
              B2B
            </span>
          )}

          {isLoggedIn ? (
            <Link
              href={dashboardHref}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              {dashboardLabel}
            </Link>
          ) : (
            <Button
              variant="accent"
              size="sm"
              asChild
              className="hidden sm:inline-flex"
            >
              <Link href={mainSiteUrl("hyr")}>{t.login}</Link>
            </Button>
          )}

          {/* Cart */}
          <Button asChild className="px-4 text-sm font-bold">
            <Link href={shopUrl("cart")}>
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">{t.cart}</span>
              {totalItems > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>
          </Button>

          <button
            type="button"
            className="md:hidden cursor-pointer select-none rounded-lg p-2 text-white transition-[background-color,color,transform] duration-200 ease-out hover:bg-white/15 active:bg-white/25 motion-safe:active:scale-[0.95]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[hsl(222,47%,9%)]">
          <div className="container mx-auto px-4 py-4 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <input
                type="search"
                placeholder={t.search}
                className="w-full rounded-xl bg-white/10 border border-white/15 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none"
              />
            </div>
            <Link
              href={shopUrl()}
              className="block px-3 py-2.5 text-sm text-white/70 hover:text-white rounded-xl hover:bg-white/10"
              onClick={() => setMobileOpen(false)}
            >
              {t.home}
            </Link>
            <Link
              href={shopUrl("cart")}
              className="block px-3 py-2.5 text-sm text-amber-400 font-semibold rounded-xl hover:bg-white/10"
              onClick={() => setMobileOpen(false)}
            >
              {t.cart} {totalItems > 0 && `(${totalItems})`}
            </Link>
            {isAdmin && (
              <Link
                href={shopUrl("admin/products")}
                className="block px-3 py-2.5 text-sm text-amber-400 font-semibold rounded-xl hover:bg-white/10"
                onClick={() => setMobileOpen(false)}
              >
                {t.admin}
              </Link>
            )}
            {isLoggedIn ? (
              <Link
                href={dashboardHref}
                className="block px-3 py-2.5 text-sm text-white/90 font-medium rounded-xl hover:bg-white/10"
                onClick={() => setMobileOpen(false)}
              >
                {dashboardLabel}
              </Link>
            ) : (
              <Link
                href={mainSiteUrl("hyr")}
                className="block px-3 py-2.5 text-sm text-amber-400 font-semibold rounded-xl hover:bg-white/10"
                onClick={() => setMobileOpen(false)}
              >
                {t.login}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
