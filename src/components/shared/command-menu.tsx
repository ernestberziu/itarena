"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "cmdk";
import {
  LayoutDashboard,
  Ticket,
  Users,
  FileText,
  ShoppingBag,
  Package,
  UserCog,
  BarChart3,
  Settings,
  Calendar,
  Plus,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";
import { crossAppAdminHref } from "@/components/admin/admin-href";
import {
  PORTAL_MAIN_NAV,
  filterPortalNav,
  type PortalNavContext,
} from "@/components/portal/portal-nav-config";

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "admin" | "portal";
  /** When admin panel runs on shop host, resolve main-app links absolutely */
  adminContext?: "locale" | "shop";
  adminLocale?: "sq" | "en";
  portalNavContext?: PortalNavContext;
  portalLocale?: "sq" | "en";
}

type AdminNavKey =
  | "dashboard"
  | "notifications"
  | "tickets"
  | "calendar"
  | "clients"
  | "quotes"
  | "orders"
  | "catalog"
  | "staff"
  | "reports"
  | "templates"
  | "settings";

const adminNavDefs: {
  key: AdminNavKey;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}[] = [
  { key: "dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { key: "notifications", href: "/admin/notifications", icon: Bell },
  { key: "tickets", href: "/admin/tickets", icon: Ticket },
  { key: "calendar", href: "/admin/calendar", icon: Calendar },
  { key: "clients", href: "/admin/clients", icon: Users },
  { key: "quotes", href: "/admin/quotes", icon: FileText },
  { key: "orders", href: "/admin/orders", icon: ShoppingBag },
  { key: "catalog", href: "/admin/catalog", icon: Package },
  { key: "staff", href: "/admin/staff", icon: UserCog },
  { key: "reports", href: "/admin/reports", icon: BarChart3 },
  { key: "templates", href: "/admin/templates", icon: FileText },
  { key: "settings", href: "/admin/settings", icon: Settings },
];

const portalNavLabels: Record<string, { sq: string; en: string }> = {
  dashboard: { sq: "Paneli", en: "Dashboard" },
  my_tickets: { sq: "Biletat e mia", en: "My tickets" },
  orders: { sq: "Porositë", en: "Orders" },
  quotes: { sq: "Ofertat", en: "Quotes" },
  company: { sq: "Kompania", en: "Company" },
  projects: { sq: "Projektet", en: "Projects" },
  notifications: { sq: "Njoftimet", en: "Notifications" },
  settings: { sq: "Cilësimet", en: "Settings" },
};

function buildPortalNav(ctx?: PortalNavContext, locale: "sq" | "en" = "sq") {
  if (!ctx) {
    return [
      { label: portalNavLabels.dashboard[locale], href: "/portal/dashboard", icon: LayoutDashboard },
      { label: portalNavLabels.my_tickets[locale], href: "/portal/tickets", icon: Ticket },
      { label: portalNavLabels.orders[locale], href: "/portal/orders", icon: ShoppingBag },
      { label: portalNavLabels.settings[locale], href: "/portal/settings", icon: Settings },
    ];
  }
  return filterPortalNav(PORTAL_MAIN_NAV, ctx).map((item) => ({
    label: portalNavLabels[item.transKey]?.[locale] ?? item.transKey,
    href: item.href,
    icon: item.icon,
  }));
}

const groupHeadingClass =
  "px-1 [&_.cmdk-group-heading]:px-2 [&_.cmdk-group-heading]:pb-0.5 [&_.cmdk-group-heading]:pt-2";

const itemClass = cn(
  "flex min-h-9 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm outline-none",
  "hover:bg-muted/50 focus:bg-muted/50 data-[selected=true]:bg-muted/55",
  "motion-reduce:transition-none motion-safe:transition-colors"
);

const kbdChip =
  "inline-flex items-center rounded-md border border-border/80 bg-background px-2 py-0.5 font-mono text-[10px] font-medium text-muted-foreground shadow-[inset_0_1px_0_hsl(var(--background))]";

export function CommandMenu({
  open,
  onOpenChange,
  mode = "admin",
  adminContext = "locale",
  adminLocale = "sq",
  portalNavContext,
  portalLocale = "sq",
}: CommandMenuProps) {
  const router = useRouter();
  const locale = useLocale();
  const tAdmin = useTranslations("admin.commandMenu");
  const tPortal = useTranslations("portal.commandMenu");
  const t = mode === "admin" ? tAdmin : tPortal;
  const lp = locale === "sq" ? "" : `/${locale}`;
  const effectiveAdminLocale =
    adminLocale === "en" ? "en" : locale === "en" ? "en" : "sq";
  const effectivePortalLocale =
    portalLocale === "en" ? "en" : locale === "en" ? "en" : "sq";

  const nav =
    mode === "admin"
      ? adminNavDefs.map((item) => ({
          label: tAdmin(item.key),
          href: item.href,
          icon: item.icon,
        }))
      : buildPortalNav(portalNavContext, effectivePortalLocale);

  function go(href: string) {
    if (mode === "admin") {
      const resolved = crossAppAdminHref(
        adminContext,
        effectiveAdminLocale,
        href
      );
      if (resolved.startsWith("http://") || resolved.startsWith("https://")) {
        if (typeof window !== "undefined") {
          try {
            const u = new URL(resolved);
            if (u.origin === window.location.origin) {
              router.push(`${u.pathname}${u.search}${u.hash}`);
              onOpenChange(false);
              return;
            }
          } catch {
            /* fall through */
          }
        }
        window.location.assign(resolved);
      } else {
        router.push(resolved);
      }
    } else {
      router.push(`${lp}${href}`);
    }
    onOpenChange(false);
  }

  const isAdmin = mode === "admin";

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !open) return null;

  const overlay = (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 motion-reduce:backdrop-blur-none motion-safe:backdrop-blur-md",
          isAdmin ? "bg-black/50" : "bg-black/40 motion-safe:backdrop-blur-sm"
        )}
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center px-4 pt-[max(4rem,12vh)] sm:pt-[18vh]"
        role="presentation"
      >
          <div className="pointer-events-auto w-full max-w-lg">
            <Command
              data-command-palette
              data-mode={mode}
              shouldFilter
              className={cn(
                "overflow-hidden",
                isAdmin
                  ? "rounded-xl bg-popover/95"
                  : "rounded-2xl border border-border/60 bg-popover shadow-2xl"
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-3 border-b border-border/50 px-3 py-3 md:px-4",
                  isAdmin && "bg-muted/10"
                )}
              >
                <div className="flex min-h-10 min-w-0 flex-1 items-center gap-2.5 rounded-lg border border-border/60 bg-muted/25 px-3 py-2 shadow-[inset_0_1px_2px_hsl(222_47%_8%_/0.05)]">
                  <Search
                    className="h-4 w-4 shrink-0 text-muted-foreground opacity-80"
                    strokeWidth={2}
                  />
                  <CommandInput
                    placeholder={t("searchPlaceholder")}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    autoFocus
                  />
                </div>
                <kbd className={cn(kbdChip, "hidden shrink-0 sm:inline-flex")}>Esc</kbd>
              </div>
              <CommandList className="max-h-[min(18rem,50vh)] overflow-y-auto px-1.5 py-2">
                <CommandEmpty className="py-10 text-center text-sm text-muted-foreground">
                  {t("noResults")}
                </CommandEmpty>
                <CommandGroup heading={t("navigation")} className={groupHeadingClass}>
                  {nav.map((item) => {
                    const Icon = item.icon;
                    return (
                      <CommandItem
                        key={item.href}
                        value={item.label}
                        onSelect={() => go(item.href)}
                        className={itemClass}
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                        {item.label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                {mode === "portal" && (
                  <>
                    <CommandSeparator className="my-1.5 h-px bg-border/70" />
                    <CommandGroup heading={t("quickActions")} className={groupHeadingClass}>
                      <CommandItem
                        value={tPortal("newTicket")}
                        onSelect={() => go("/portal/tickets/new")}
                        className={itemClass}
                      >
                        <Plus className="h-4 w-4 text-muted-foreground" />
                        {tPortal("newTicket")}
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
                {mode === "admin" && (
                  <>
                    <CommandSeparator className="my-1.5 h-px bg-border/70" />
                    <CommandGroup heading={tAdmin("quickActions")} className={groupHeadingClass}>
                      <CommandItem
                        value={tAdmin("newTicket")}
                        onSelect={() => go("/admin/tickets/new")}
                        className={itemClass}
                      >
                        <Plus className="h-4 w-4 text-muted-foreground" />
                        {tAdmin("newTicket")}
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border/50 bg-muted/10 px-4 py-2.5 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <kbd className={kbdChip}>↑↓</kbd>
                  {t("moveHint")}
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className={kbdChip}>↵</kbd>
                  {t("selectHint")}
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className={kbdChip}>Esc</kbd>
                  {t("closeHint")}
                </span>
              </div>
            </Command>
          </div>
        </div>
    </>
  );

  return createPortal(overlay, document.body);
}

export function useCommandMenu() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return { open, setOpen };
}
