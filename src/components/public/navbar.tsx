"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  Menu, X, Globe, Phone, ChevronDown,
  Monitor, Cloud, Globe as GlobeIcon, Camera, Wifi,
  Code2, Network, Printer,
  ArrowRight, ShoppingBag, LayoutDashboard, LogOut, Loader2,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { isStaff } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ItArenaLogo } from "@/components/brand/logo";
import { shopUrl } from "@/lib/shop-url";

const services = [
  { key: "it_support", href: "/sherbime/it-support", icon: Monitor, color: "text-blue-500" },
  { key: "cloud", href: "/sherbime/cloud", icon: Cloud, color: "text-sky-500" },
  { key: "telecom", href: "/sherbime/telekomunikacion", icon: Wifi, color: "text-violet-500" },
  { key: "web", href: "/sherbime/web-marketing", icon: GlobeIcon, color: "text-emerald-500" },
  { key: "cctv", href: "/sherbime/cctv-siguri", icon: Camera, color: "text-rose-500" },
  { key: "network", href: "/sherbime/rrjet", icon: Network, color: "text-orange-500" },
  { key: "software", href: "/sherbime/software", icon: Code2, color: "text-indigo-500" },
  { key: "printers", href: "/sherbime/printere", icon: Printer, color: "text-teal-500" },
];

export function Navbar() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession();

  const otherLocale = locale === "sq" ? "en" : "sq";
  const localePath = locale === "sq" ? "" : `/${locale}`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function switchLanguage() {
    router.replace(pathname, { locale: otherLocale });
    setMobileOpen(false);
  }

  const navLink = (href: string) => `${localePath}${href}`;

  const dashboardPath =
    session?.user && isStaff(session.user.role)
      ? "/admin/dashboard"
      : "/portal/dashboard";
  const dashboardHref = navLink(dashboardPath);
  const dashboardLabel =
    session?.user && isStaff(session.user.role)
      ? t("nav.admin")
      : t("nav.portal");

  async function handleSignOut() {
    setMobileOpen(false);
    await signOut({ callbackUrl: locale === "en" ? "/en" : "/" });
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-white/95 backdrop-blur-xl shadow-sm"
          : "border-b border-transparent bg-white/80 backdrop-blur-md"
      )}
    >
      {/* Top accent bar */}
      <div className="h-0.5 w-full gradient-border" />

      {/* Top info bar */}
      <div className="border-b border-border/30 bg-slate-50/80 py-1.5 hidden lg:block">
        <div className="container mx-auto flex items-center justify-between px-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-5">
            <a
              href="tel:+355696314319"
              className="flex items-center gap-1.5 hover:text-primary transition-colors font-medium"
            >
              <Phone className="h-3 w-3" />
              +355 69 63 14 319
            </a>
            <span className="text-border">|</span>
            <span>E Hënë–E Premte · 08:00–17:30</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              24/7 Emergjencë
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href={navLink("/mbeshtetje-remote")} className="hover:text-primary transition-colors">
              Mbështetje Remote
            </Link>
            <Link
              href={shopUrl()}
              className="flex items-center gap-1 hover:text-primary transition-colors font-medium"
            >
              <ShoppingBag className="h-3 w-3" />
              IT Shop
            </Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={localePath || "/"} className="flex items-center group">
          <ItArenaLogo variant="light" size="md" showTagline />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Services mega-dropdown — single hover zone + padding bridge so pointer can reach panel */}
          <div
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button
              type="button"
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                servicesOpen
                  ? "text-primary bg-primary/8"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              {t("nav.services")}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  servicesOpen && "rotate-180"
                )}
              />
            </button>

            {servicesOpen && (
              <div className="absolute left-1/2 top-full z-50 w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 pt-2">
                <div className="rounded-2xl border bg-white shadow-2xl shadow-slate-200/80 overflow-hidden">
                {/* Mega menu header */}
                <div className="px-5 py-3 border-b bg-gradient-to-r from-primary/5 to-blue-50">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    {t("services.subtitle")}
                  </p>
                </div>
                {/* Grid of services */}
                <div className="grid grid-cols-2 gap-0.5 p-3">
                  {services.map((s) => {
                    const Icon = s.icon;
                    return (
                      <Link
                        key={s.key}
                        href={navLink(s.href)}
                        className="flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 transition-colors group"
                      >
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 group-hover:bg-white transition-colors shadow-sm">
                          <Icon className={cn("h-4 w-4", s.color)} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground leading-tight">
                            {t(`services.${s.key}.name`)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed truncate">
                            {t(`services.${s.key}.desc`)}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                {/* Footer CTA */}
                <div className="border-t px-5 py-3 bg-slate-50/60 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {locale === "sq" ? "Nevojat? Flisni me ekspertët." : "Need help? Talk to our experts."}
                  </span>
                  <Link
                    href={navLink("/kerko-oferte")}
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    {t("nav.quoteRequest")} <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                </div>
              </div>
            )}
          </div>

          {[
            { href: "/industrite", label: t("nav.industries") },
            { href: "/rreth-nesh", label: t("nav.about") },
            { href: "/kontakt", label: t("nav.contact") },
          ].map((item) => (
            <Link
              key={item.href}
              href={navLink(item.href)}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-all",
                pathname.includes(item.href.slice(1))
                  ? "text-primary bg-primary/8"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={switchLanguage}
            className="flex items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1.5 text-xs font-semibold text-muted-foreground cursor-pointer select-none transition-[background-color,color,border-color,transform] duration-200 ease-out hover:border-border/50 hover:bg-muted/60 hover:text-foreground active:bg-muted motion-safe:active:scale-[0.97]"
            title={otherLocale === "en" ? "Switch to English" : "Kalo në Shqip"}
          >
            <Globe className="h-3.5 w-3.5" />
            <span className="hidden sm:inline uppercase tracking-wide">
              {otherLocale === "en" ? "EN" : "SQ"}
            </span>
          </button>

          <Button asChild>
            <Link href={navLink("/kerko-oferte")}>{t("nav.quoteRequest")}</Link>
          </Button>

          {status === "loading" ? (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="hidden md:inline-flex text-sm font-medium min-w-[7.5rem]"
              aria-busy
            >
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          ) : session ? (
            <div className="hidden md:flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="text-sm font-medium gap-1.5"
              >
                <Link href={dashboardHref}>
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  {dashboardLabel}
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-transparent bg-transparent text-muted-foreground shadow-none hover:bg-muted/60 hover:text-foreground px-2"
                onClick={() => void handleSignOut()}
                title={t("nav.logout")}
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">{t("nav.logout")}</span>
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden md:inline-flex text-sm font-medium"
            >
              <Link href={navLink("/hyr")}>{t("nav.login")}</Link>
            </Button>
          )}

          <button
            type="button"
            className="cursor-pointer select-none rounded-lg p-2 text-foreground transition-[background-color,color,transform] duration-200 ease-out hover:bg-muted active:bg-muted/80 motion-safe:active:scale-[0.95] md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white shadow-xl">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            <Link
              href={navLink("/sherbime")}
              className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {t("nav.services")}
            </Link>
            {[
              { href: "/industrite", label: t("nav.industries") },
              { href: "/rreth-nesh", label: t("nav.about") },
              { href: "/kontakt", label: t("nav.contact") },
            ].map((item) => (
              <Link
                key={item.href}
                href={navLink(item.href)}
                className="px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={shopUrl()}
              className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors text-primary"
              onClick={() => setMobileOpen(false)}
            >
              <ShoppingBag className="h-4 w-4" />
              IT Shop
            </Link>
            <div className="pt-3 border-t mt-2 flex flex-col gap-2">
              <Button asChild>
                <Link href={navLink("/kerko-oferte")} onClick={() => setMobileOpen(false)}>
                  {t("nav.quoteRequest")}
                </Link>
              </Button>
              {status === "loading" ? (
                <Button variant="outline" disabled className="justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </Button>
              ) : session ? (
                <>
                  <Button variant="outline" asChild>
                    <Link
                      href={dashboardHref}
                      onClick={() => setMobileOpen(false)}
                      className="gap-2"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {dashboardLabel}
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="justify-start border-transparent bg-transparent text-muted-foreground shadow-none hover:bg-muted/60 hover:text-foreground"
                    onClick={() => void handleSignOut()}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t("nav.logout")}
                  </Button>
                </>
              ) : (
                <Button variant="outline" asChild>
                  <Link href={navLink("/hyr")} onClick={() => setMobileOpen(false)}>
                    {t("nav.login")}
                  </Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
