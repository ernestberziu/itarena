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

import type { MarketingServiceRecord, SiteSettingsBundle } from "@/lib/site-content/types";
import { getLucideIcon } from "@/lib/site-content/icons";
import { serviceName, serviceShortDesc } from "@/lib/site-content/locale";

const fallbackServices = [
  { key: "it_support", href: "/sherbime/it-support", icon: Monitor, color: "text-blue-500" },
  { key: "cloud", href: "/sherbime/cloud", icon: Cloud, color: "text-sky-500" },
  { key: "telecom", href: "/sherbime/telekomunikacion", icon: Wifi, color: "text-violet-500" },
  { key: "web", href: "/sherbime/web-marketing", icon: GlobeIcon, color: "text-emerald-500" },
  { key: "cctv", href: "/sherbime/cctv-siguri", icon: Camera, color: "text-rose-500" },
  { key: "network", href: "/sherbime/rrjet", icon: Network, color: "text-orange-500" },
  { key: "software", href: "/sherbime/software", icon: Code2, color: "text-indigo-500" },
  { key: "printers", href: "/sherbime/printere", icon: Printer, color: "text-teal-500" },
];

export function Navbar({
  services: cmsServices,
}: {
  services?: MarketingServiceRecord[];
  siteSettings?: SiteSettingsBundle;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
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

  useEffect(() => {
    if (!mobileOpen) {
      setMobileServicesOpen(false);
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function switchLanguage() {
    router.replace(pathname, { locale: otherLocale });
    setMobileOpen(false);
  }

  const navLink = (href: string) => `${localePath}${href}`;

  const menuServices = cmsServices?.length
    ? cmsServices
        .filter((s) => s.enabled)
        .map((s) => ({
          key: s.slug,
          href: `/sherbime/${s.slug}`,
          icon: getLucideIcon(s.iconKey),
          color: s.colorClass?.split(" ")[1] ?? "text-primary",
          name: serviceName(s, locale),
          desc: serviceShortDesc(s, locale),
        }))
    : fallbackServices.map((s) => ({
        ...s,
        name: t(`services.${s.key}.name`),
        desc: t(`services.${s.key}.desc`),
      }));

  const dashboardPath =
    session?.user && isStaff(session.user.role)
      ? "/admin"
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
      <div className="container mx-auto flex h-14 items-center justify-between gap-2 px-3 sm:h-16 sm:gap-3 sm:px-4">
        {/* Logo — compact on mobile */}
        <Link href={localePath || "/"} className="flex min-w-0 shrink items-center">
          <ItArenaLogo variant="light" size="sm" showTagline={false} className="md:hidden" />
          <ItArenaLogo variant="light" size="md" showTagline className="hidden md:flex" />
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
                  {menuServices.map((s) => {
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
                            {s.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed truncate">
                            {s.desc}
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
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={switchLanguage}
            className="flex h-9 min-w-9 items-center justify-center gap-1 rounded-lg border border-transparent px-2 text-xs font-semibold text-muted-foreground cursor-pointer select-none transition-[background-color,color,border-color,transform] duration-200 ease-out hover:border-border/50 hover:bg-muted/60 hover:text-foreground active:bg-muted motion-safe:active:scale-[0.97] sm:min-w-0 sm:px-2.5 sm:py-1.5"
            title={otherLocale === "en" ? "Switch to English" : "Kalo në Shqip"}
          >
            <Globe className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            <span className="uppercase tracking-wide">{otherLocale === "en" ? "EN" : "SQ"}</span>
          </button>

          <Button asChild className="hidden md:inline-flex">
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
            className="flex h-10 w-10 cursor-pointer select-none items-center justify-center rounded-xl border border-border/60 bg-muted/30 text-foreground transition-[background-color,color,transform] duration-200 ease-out hover:bg-muted active:bg-muted/80 motion-safe:active:scale-[0.95] md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 top-14 z-40 bg-slate-900/40 backdrop-blur-[2px] md:hidden sm:top-16"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50 md:hidden">
            <nav className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t bg-white shadow-xl sm:max-h-[calc(100dvh-4rem)]">
              <div className="container mx-auto space-y-1 px-3 py-4 sm:px-4">
                {/* Quick contact strip */}
                <div className="mb-3 space-y-2 rounded-xl border border-border/60 bg-slate-50/90 p-3">
                  <a
                    href="tel:+355696314319"
                    className="flex items-center gap-2.5 text-sm font-semibold text-foreground"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Phone className="h-4 w-4" />
                    </span>
                    +355 69 63 14 319
                  </a>
                  <p className="pl-[2.875rem] text-xs text-muted-foreground">
                    {locale === "sq" ? "E Hënë–E Premte · 08:00–17:30" : "Mon–Fri · 08:00–17:30"}
                  </p>
                  <span className="ml-[2.875rem] inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    24/7 {locale === "sq" ? "Emergjencë" : "Emergency"}
                  </span>
                </div>

                {/* Services accordion */}
                <div className="overflow-hidden rounded-xl border border-border/60">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-semibold text-foreground"
                    onClick={() => setMobileServicesOpen((open) => !open)}
                    aria-expanded={mobileServicesOpen}
                  >
                    {t("nav.services")}
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        mobileServicesOpen && "rotate-180"
                      )}
                    />
                  </button>
                  {mobileServicesOpen && (
                    <div className="border-t border-border/60 bg-slate-50/50 px-2 py-2">
                      <Link
                        href={navLink("/sherbime")}
                        className="mb-1 block rounded-lg px-3 py-2.5 text-sm font-medium text-primary"
                        onClick={() => setMobileOpen(false)}
                      >
                        {locale === "sq" ? "Të gjitha shërbimet" : "All services"}
                      </Link>
                      {menuServices.map((s) => {
                        const Icon = s.icon;
                        return (
                          <Link
                            key={s.key}
                            href={navLink(s.href)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-white"
                            onClick={() => setMobileOpen(false)}
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                              <Icon className={cn("h-4 w-4", s.color)} />
                            </span>
                            <span className="min-w-0 font-medium leading-snug">{s.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                {[
                  { href: "/industrite", label: t("nav.industries") },
                  { href: "/rreth-nesh", label: t("nav.about") },
                  { href: "/kontakt", label: t("nav.contact") },
                  { href: "/mbeshtetje-remote", label: locale === "sq" ? "Mbështetje Remote" : "Remote Support" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={navLink(item.href)}
                    className="block rounded-xl px-4 py-3.5 text-sm font-medium transition-colors hover:bg-slate-50"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                <Link
                  href={shopUrl()}
                  className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <ShoppingBag className="h-4 w-4" />
                  </span>
                  IT Shop
                </Link>

                <button
                  type="button"
                  onClick={switchLanguage}
                  className="flex w-full items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-slate-50 hover:text-foreground"
                >
                  <Globe className="h-4 w-4" />
                  {locale === "sq" ? "Switch to English" : "Kalo në Shqip"}
                </button>

                <div className="space-y-2 border-t border-border/60 pt-4">
                  <Button asChild className="w-full min-h-11">
                    <Link href={navLink("/kerko-oferte")} onClick={() => setMobileOpen(false)}>
                      {t("nav.quoteRequest")}
                    </Link>
                  </Button>
                  {status === "loading" ? (
                    <Button variant="outline" disabled className="w-full min-h-11 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </Button>
                  ) : session ? (
                    <>
                      <Button variant="outline" asChild className="w-full min-h-11">
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
                        className="w-full min-h-11 justify-center"
                        onClick={() => void handleSignOut()}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {t("nav.logout")}
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" asChild className="w-full min-h-11">
                      <Link href={navLink("/hyr")} onClick={() => setMobileOpen(false)}>
                        {t("nav.login")}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
