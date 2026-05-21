"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname as useNextPathname } from "next/navigation";
import { usePathname as useIntlPathname, useRouter as useIntlRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import {
  Menu,
  Search,
  PanelLeftClose,
  PanelLeft,
  Bell,
  LogOut,
  User,
  ChevronDown,
  Globe,
  Home,
  Plus,
  ShoppingBag,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ItArenaLogo } from "@/components/brand/logo";
import { CommandMenu, useCommandMenu } from "@/components/shared/command-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PORTAL_MAIN_NAV,
  filterPortalNav,
  type PortalNavContext,
} from "@/components/portal/portal-nav-config";
import { SHOP_CATEGORY_SELECTED_TEXT } from "@/lib/shop-category-selected-color";
import type { PortalRole } from "@/lib/portal/access";
import { useNotificationCount } from "@/components/providers/notification-count-provider";
import {
  NotificationBellBadge,
  NotificationCollapsedDot,
  NotificationNavBadge,
} from "@/components/shared/notification-count-badge";
import { AppShellMobileHeaderActions } from "@/components/shared/app-shell-mobile-header-actions";

const COLLAPSE_KEY = "portal-sidebar-collapsed";

const SIDEBAR_LABEL_PANEL_CLASS = cn(
  "z-50 w-max max-w-xs origin-(--transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-left text-sm font-medium leading-snug text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none",
  "data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95"
);

function clientRoleLabel(_role: PortalRole, locale: "sq" | "en"): string {
  return locale === "en" ? "Client" : "Klient";
}

export interface PortalAppShellProps {
  children: React.ReactNode;
  userRole: PortalRole;
  userInitials: string;
  userName: string;
  userEmail?: string;
  locale: "sq" | "en";
  notificationCount?: number;
  navContext: PortalNavContext;
}

export function PortalAppShell({
  children,
  userRole,
  userInitials,
  userName,
  userEmail,
  locale,
  notificationCount = 0,
  navContext,
}: PortalAppShellProps) {
  const liveNotificationCount = useNotificationCount(notificationCount);
  const pathname = useNextPathname();
  const intlPathname = useIntlPathname();
  const intlRouter = useIntlRouter();
  const t = useTranslations("portal");
  const tNav = useTranslations("nav");
  const { open, setOpen } = useCommandMenu();

  const lp = locale === "en" ? "/en" : "";
  const homeHref = locale === "en" ? "/en" : "/";
  const otherLocale = locale === "sq" ? "en" : "sq";
  const shopHref = "/shop";
  const quoteRequestHref = `${lp}/kerko-oferte`;

  function switchLanguage() {
    intlRouter.replace(intlPathname, { locale: otherLocale });
    setMobileOpen(false);
  }

  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setHydrated(true);
    try {
      if (typeof window !== "undefined" && localStorage.getItem(COLLAPSE_KEY) === "1") {
        setCollapsed(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed, hydrated]);

  React.useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-portal-ui", "true");
    root.setAttribute("data-admin-ui", "true");
    return () => {
      root.removeAttribute("data-portal-ui");
      root.removeAttribute("data-admin-ui");
    };
  }, []);

  const navItems = filterPortalNav(PORTAL_MAIN_NAV, navContext);

  const settingsHref = `${lp}/portal/settings`;
  const notificationsHref = `${lp}/portal/notifications`;
  const newTicketHref = `${lp}/portal/tickets/new`;

  function resolveHref(path: string) {
    return `${lp}${path}`;
  }

  function isRouteActive(href: string) {
    if (pathname === href) return true;
    if (href !== lp && pathname.startsWith(href + "/")) return true;
    return false;
  }

  const NavLink = ({
    href,
    icon: Icon,
    label,
    active,
    badge,
  }: {
    href: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    label: string;
    active: boolean;
    badge?: number;
  }) => {
    const linkClassName = cn(
      "group flex items-center rounded-xl py-2 text-sm font-medium transition-colors duration-200 ease-out",
      collapsed ? "justify-center gap-0 px-2" : "gap-3 px-3",
      active ? undefined : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
    );
    const linkStyle = active ? { color: SHOP_CATEGORY_SELECTED_TEXT } : undefined;

    const inner = (
      <>
        <span className="relative shrink-0">
          <Icon className="h-4 w-4" strokeWidth={2} />
          {collapsed && badge != null && badge > 0 ? <NotificationCollapsedDot /> : null}
        </span>
        {!collapsed && <span className="flex-1 truncate">{label}</span>}
        {!collapsed && badge != null && badge > 0 ? <NotificationNavBadge count={badge} /> : null}
      </>
    );

    if (collapsed && hydrated) {
      return (
        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                href={href}
                onClick={() => setMobileOpen(false)}
                className={linkClassName}
                style={linkStyle}
              />
            }
          >
            {inner}
          </TooltipTrigger>
          <TooltipContent
            data-slot="admin-sidebar-tooltip"
            side="right"
            sideOffset={10}
            align="center"
            showArrow={false}
            className={SIDEBAR_LABEL_PANEL_CLASS}
          >
            {label}
            {badge != null && badge > 0 ? ` (${badge})` : ""}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        className={linkClassName}
        style={linkStyle}
      >
        {inner}
      </Link>
    );
  };

  const sidebarInner = (
    <div className="flex h-full min-h-0 flex-col border-r border-[hsl(var(--admin-sidebar-border))] bg-[hsl(var(--admin-sidebar))] shadow-[var(--admin-shadow-sm)]">
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-border/60",
          collapsed ? "justify-center px-2" : "gap-2 px-3"
        )}
      >
        <div className={cn("flex min-w-0 items-center gap-2", collapsed && "justify-center")}>
          <Link
            href={homeHref}
            className="rounded-lg outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring/40"
            aria-label={tNav("home")}
          >
            <ItArenaLogo
              variant="light"
              size="sm"
              markOnly={collapsed}
              className={collapsed ? "h-4 w-auto shrink-0" : undefined}
            />
          </Link>
          {!collapsed && (
            <span className="rounded-md border border-border/80 bg-muted/40 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {clientRoleLabel(userRole, locale)}
            </span>
          )}
        </div>
      </div>

      <div className="px-2 py-3">
        {!collapsed ? (
          <Button asChild size="sm" className="mb-3 w-full justify-start gap-2 text-xs">
            <Link href={newTicketHref} onClick={() => setMobileOpen(false)}>
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              {t("new_ticket")}
            </Link>
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  asChild
                  size="sm"
                  className="mb-3 w-full justify-center px-2"
                />
              }
            >
              <Link href={newTicketHref} onClick={() => setMobileOpen(false)}>
                <Plus className="h-4 w-4" strokeWidth={2} />
              </Link>
            </TooltipTrigger>
            <TooltipContent
              data-slot="admin-sidebar-tooltip"
              side="right"
              sideOffset={10}
              showArrow={false}
              className={SIDEBAR_LABEL_PANEL_CLASS}
            >
              {t("new_ticket")}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {!collapsed && (
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            {t("main_section")}
          </p>
        )}
        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const href = resolveHref(item.href);
            return (
              <NavLink
                key={item.id}
                href={href}
                icon={item.icon}
                label={t(item.transKey)}
                active={isRouteActive(href)}
                badge={item.id === "notifications" ? liveNotificationCount : undefined}
              />
            );
          })}
        </nav>
      </div>

      <div className="shrink-0 border-t border-border/60 p-2">
        {!collapsed && (
          <div className="mb-2 flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{userName}</p>
              {userEmail && (
                <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
              )}
            </div>
          </div>
        )}
        {collapsed && hydrated ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full justify-center gap-2 border-transparent bg-transparent px-2 text-muted-foreground shadow-none hover:bg-muted/50 hover:text-foreground"
                  onClick={() => signOut({ callbackUrl: "/" })}
                />
              }
            >
              <LogOut className="h-4 w-4 shrink-0" strokeWidth={2} />
            </TooltipTrigger>
            <TooltipContent
              data-slot="admin-sidebar-tooltip"
              side="right"
              sideOffset={10}
              showArrow={false}
              className={SIDEBAR_LABEL_PANEL_CLASS}
            >
              {tNav("logout")}
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 border-transparent bg-transparent text-muted-foreground shadow-none hover:bg-muted/50 hover:text-foreground"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={2} />
            {!collapsed && <span className="text-xs">{tNav("logout")}</span>}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <TooltipProvider delay={200}>
      <div
        data-portal-shell
        className="flex h-dvh min-h-dvh max-h-dvh overflow-hidden bg-[hsl(var(--admin-canvas))]"
      >
        <aside
          className={cn(
            "relative hidden shrink-0 transition-[width] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none md:block",
            collapsed ? "w-[4.5rem]" : "w-60"
          )}
        >
          {sidebarInner}
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="z-40 shrink-0 border-b border-border/60 bg-background/90 shadow-[var(--admin-shadow-sm)] backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
            <div className="flex h-14 items-center gap-2 px-3 md:px-4">
              <div className="flex shrink-0 items-center gap-1 md:hidden">
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger
                    render={
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 w-10 border-border/40 bg-background/80 p-0 shadow-none hover:bg-muted/60"
                      />
                    }
                  >
                    <Menu className="h-5 w-5" strokeWidth={2} />
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[min(100%,20rem)] p-0">
                    <div className="h-full w-full max-w-[20rem]">{sidebarInner}</div>
                  </SheetContent>
                </Sheet>
                <Link
                  href={`${lp}/portal/dashboard`}
                  className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  aria-label="IT Arena Portal"
                >
                  <ItArenaLogo variant="light" size="sm" />
                </Link>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="hidden h-9 w-9 shrink-0 border-border/40 bg-background/80 p-0 shadow-none hover:bg-muted/60 md:inline-flex"
                onClick={() => setCollapsed((c) => !c)}
                aria-label={collapsed ? t("expand_sidebar") : t("collapse_sidebar")}
              >
                {collapsed ? (
                  <PanelLeft className="h-4 w-4" strokeWidth={2} />
                ) : (
                  <PanelLeftClose className="h-4 w-4" strokeWidth={2} />
                )}
              </Button>

              <button
                type="button"
                onClick={() => setOpen(true)}
                className="hidden min-w-0 flex-1 items-center gap-2 rounded-xl border border-border/80 bg-muted/40 px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:border-border hover:bg-muted/60 md:flex md:max-w-md"
              >
                <Search className="h-4 w-4 shrink-0 opacity-70" strokeWidth={2} />
                <span className="flex-1 truncate text-xs">{t("search_placeholder")}</span>
                <kbd className="hidden shrink-0 rounded border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground lg:inline">
                  ⌘K
                </kbd>
              </button>

              <div className="hidden items-center gap-2 md:flex">
                <Button variant="outline" size="sm" className="h-9 shrink-0 gap-1.5" asChild>
                  <Link href={shopHref}>
                    <ShoppingBag className="h-4 w-4 shrink-0" strokeWidth={2} />
                    <span className="text-xs font-medium">{t("shop")}</span>
                  </Link>
                </Button>

                <Button variant="outline" size="sm" className="h-9 shrink-0 gap-1.5" asChild>
                  <Link href={quoteRequestHref}>
                    <FileText className="h-4 w-4 shrink-0" strokeWidth={2} />
                    <span className="text-xs font-medium">{t("request_quote")}</span>
                  </Link>
                </Button>

                <Button variant="outline" size="sm" className="h-9 shrink-0 gap-1.5" asChild>
                  <Link href={homeHref}>
                    <Home className="h-4 w-4 shrink-0" strokeWidth={2} />
                    <span className="text-xs font-medium">{tNav("home")}</span>
                  </Link>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 shrink-0 gap-1.5 border-border/40 bg-background/80 shadow-none hover:bg-muted/60"
                  onClick={switchLanguage}
                >
                  <Globe className="h-4 w-4 shrink-0" strokeWidth={2} />
                  <span className="text-xs font-semibold uppercase tabular-nums">{otherLocale}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "relative h-9 w-9 shrink-0 overflow-visible border-border/40 p-0 shadow-none hover:bg-muted/60",
                    liveNotificationCount > 0
                      ? "bg-accent/15 border-amber-600/30 hover:bg-accent/25"
                      : "bg-background/80"
                  )}
                  asChild
                >
                  <Link
                    href={notificationsHref}
                    className="relative inline-flex h-9 w-9 items-center justify-center overflow-visible"
                    aria-label={
                      liveNotificationCount > 0
                        ? `${t("notifications")} (${liveNotificationCount})`
                        : t("notifications")
                    }
                  >
                    <Bell
                      className={cn(
                        "h-4 w-4 shrink-0",
                        liveNotificationCount > 0 && "text-[hsl(var(--brand-navy))]"
                      )}
                      strokeWidth={2}
                    />
                    <NotificationBellBadge count={liveNotificationCount} />
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="outline" size="sm" className="h-9 gap-1.5 border-border/80 px-2" />
                    }
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {userInitials}
                    </span>
                    <span className="max-w-[8rem] truncate text-xs font-medium">{userName}</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-50" strokeWidth={2} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-48">
                    <DropdownMenuItem render={<Link href={settingsHref} />}>
                      <User className="h-4 w-4" strokeWidth={2} />
                      {t("settings")}
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href={shopHref} />}>
                      <ShoppingBag className="h-4 w-4" strokeWidth={2} />
                      {t("shop")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      <LogOut className="h-4 w-4" strokeWidth={2} />
                      {tNav("logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <AppShellMobileHeaderActions
                searchLabel={t("search_placeholder")}
                onOpenSearch={() => setOpen(true)}
                notificationsHref={notificationsHref}
                notificationsLabel={t("notifications")}
                notificationCount={liveNotificationCount}
                showNotifications
                userInitials={userInitials}
                userName={userName}
                menuItems={[
                  { key: "settings", label: t("settings"), icon: User, href: settingsHref },
                  { key: "shop", label: t("shop"), icon: ShoppingBag, href: shopHref },
                  {
                    key: "quote",
                    label: t("request_quote"),
                    icon: FileText,
                    href: quoteRequestHref,
                  },
                  { key: "home", label: tNav("home"), icon: Home, href: homeHref },
                  {
                    key: "lang",
                    label: locale === "sq" ? "English" : "Shqip",
                    icon: Globe,
                    onClick: switchLanguage,
                  },
                ]}
                logoutLabel={tNav("logout")}
                onLogout={() => signOut({ callbackUrl: "/" })}
              />
            </div>

            <CommandMenu
              open={open}
              onOpenChange={setOpen}
              mode="portal"
              portalNavContext={navContext}
              portalLocale={locale}
            />
          </header>

          <main className="admin-app-canvas admin-main-enter min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain p-4 md:p-6">
            <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 lg:py-8">{children}</div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
