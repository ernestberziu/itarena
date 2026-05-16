"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { MAIN_NAV, COMMERCE_NAV } from "@/components/admin/admin-nav-config";
import {
  crossAppAdminHref,
  commerceHref,
} from "@/components/admin/admin-href";
import { SHOP_CATEGORY_SELECTED_TEXT } from "@/lib/shop-category-selected-color";
import type { Role } from "@/types/domain";
import type { AdminFeature, AclLevel } from "@/lib/admin-acl/features";
import { hasAclLevel } from "@/lib/admin-acl/features";

const COLLAPSE_KEY = "admin-sidebar-collapsed";

/** Mirrors `DropdownMenuContent` classes; `data-slot=admin-sidebar-tooltip` applies html[data-admin-ui] portaled overlay chrome in globals.css */
const SIDEBAR_LABEL_PANEL_CLASS = cn(
  "z-50 w-max max-w-xs origin-(--transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-left text-sm font-medium leading-snug text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none",
  "data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95"
);

export interface AdminAppShellProps {
  children: React.ReactNode;
  userRole: Role;
  userInitials: string;
  userName: string;
  userEmail?: string;
  contextApp: "locale" | "shop";
  locale: "sq" | "en";
  notificationCount?: number;
  /** When set, main/commerce nav items require at least read access for the matching feature id. */
  effectiveAcl?: Record<AdminFeature, AclLevel> | null;
}

export function AdminAppShell({
  children,
  userRole,
  userInitials,
  userName,
  userEmail,
  contextApp,
  locale,
  notificationCount = 0,
  effectiveAcl = null,
}: AdminAppShellProps) {
  const pathname = usePathname();
  const t = useTranslations("admin");
  const tNav = useTranslations("nav");
  const { open, setOpen } = useCommandMenu();

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
    root.setAttribute("data-admin-ui", "true");
    return () => {
      root.removeAttribute("data-admin-ui");
    };
  }, []);

  const mainItems = MAIN_NAV.filter((item) => {
    if (!item.roles.includes(userRole)) return false;
    if (!effectiveAcl) return true;
    return hasAclLevel(effectiveAcl, item.id as AdminFeature, "read");
  });
  const commerceItems = COMMERCE_NAV.filter((item) => {
    if (!item.roles.includes(userRole)) return false;
    if (!effectiveAcl) return true;
    return hasAclLevel(effectiveAcl, item.id as AdminFeature, "read");
  });

  const canSeeNotifications =
    !effectiveAcl || hasAclLevel(effectiveAcl, "notifications", "read");
  const canSeeProfile = !effectiveAcl || hasAclLevel(effectiveAcl, "profile", "read");

  const profileHref = crossAppAdminHref(contextApp, locale, "/admin/profile");
  const notificationsHref = crossAppAdminHref(
    contextApp,
    locale,
    "/admin/notifications"
  );

  function resolveMainHref(path: string) {
    return crossAppAdminHref(contextApp, locale, path);
  }

  function isRouteActive(href: string) {
    try {
      const u = new URL(href, "http://local.test");
      const p = u.pathname;
      if (pathname === p) return true;
      if (p !== "/" && pathname.startsWith(p + "/")) return true;
    } catch {
      /* ignore */
    }
    if (pathname === href) return true;
    return false;
  }

  function isCommerceActive(kind: "shopProducts" | "shopOrders" | "viewShop") {
    const full = commerceHref(kind);
    try {
      const u = new URL(full);
      return pathname === u.pathname || pathname.startsWith(u.pathname + "/");
    } catch {
      return false;
    }
  }

  const NavLink = ({
    href,
    icon: Icon,
    label,
    active,
  }: {
    href: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    label: string;
    active: boolean;
  }) => {
    const linkClassName = cn(
      "group flex items-center rounded-xl py-2 text-sm font-medium transition-colors duration-200 ease-out",
      collapsed ? "justify-center gap-0 px-2" : "gap-3 px-3",
      active ? undefined : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
    );
    const linkStyle = active ? { color: SHOP_CATEGORY_SELECTED_TEXT } : undefined;

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
            <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
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
        <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
        <span className="flex-1 truncate">{label}</span>
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
          <ItArenaLogo
            variant="light"
            size="sm"
            markOnly={collapsed}
            className={collapsed ? "h-4 w-auto shrink-0" : undefined}
          />
          {!collapsed && (
            <span className="rounded-md border border-border/80 bg-muted/40 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {t("badge")}
            </span>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
        {!collapsed && (
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            {t("main_section")}
          </p>
        )}
        <nav className="flex flex-col gap-0.5">
          {mainItems.map((item) => {
            const href = resolveMainHref(item.href);
            return (
              <NavLink
                key={item.id}
                href={href}
                icon={item.icon}
                label={t(item.transKey)}
                active={isRouteActive(href)}
              />
            );
          })}
        </nav>

        {commerceItems.length > 0 && (
          <>
            {!collapsed && (
              <p className="mb-2 mt-5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                {t("commerce_section")}
              </p>
            )}
            <nav className="flex flex-col gap-0.5">
              {commerceItems.map((item) => {
                const href = commerceHref(item.path);
                return (
                  <NavLink
                    key={item.id}
                    href={href}
                    icon={item.icon}
                    label={t(item.transKey)}
                    active={isCommerceActive(item.path)}
                  />
                );
              })}
            </nav>
          </>
        )}
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
              align="center"
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
      data-admin-shell
      className="flex h-screen overflow-hidden bg-[hsl(var(--admin-canvas))]"
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
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/90 px-3 shadow-[var(--admin-shadow-sm)] backdrop-blur-md supports-[backdrop-filter]:bg-background/75 md:px-4">
          <div className="flex items-center gap-1 md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 border-border/40 bg-background/80 p-0 shadow-none hover:bg-muted/60"
                  />
                }
              >
                <Menu className="h-5 w-5" strokeWidth={2} />
              </SheetTrigger>
              <SheetContent side="left" className="w-[min(100%,20rem)] p-0">
                <div className="h-full w-full max-w-[20rem]">{sidebarInner}</div>
              </SheetContent>
            </Sheet>
            <ItArenaLogo variant="light" size="sm" />
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
            className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border/80 bg-muted/40 px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:border-border hover:bg-muted/60 md:max-w-md"
          >
            <Search className="h-4 w-4 shrink-0 opacity-70" strokeWidth={2} />
            <span className="flex-1 truncate text-xs">{t("search_placeholder")}</span>
            <kbd className="hidden shrink-0 rounded border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
              ⌘K
            </kbd>
          </button>
          <CommandMenu
            open={open}
            onOpenChange={setOpen}
            mode="admin"
            adminContext={contextApp}
            adminLocale={locale}
          />

          {canSeeNotifications ? (
          <Button
            variant="outline"
            size="sm"
            className="relative h-9 w-9 shrink-0 border-border/40 bg-background/80 p-0 shadow-none hover:bg-muted/60"
            asChild
          >
            <Link href={notificationsHref}>
              <Bell className="h-4 w-4" strokeWidth={2} />
              {notificationCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </Link>
          </Button>
          ) : null}

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 border-border/80 px-2"
                />
              }
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {userInitials}
              </span>
              <span className="hidden max-w-[8rem] truncate text-xs font-medium sm:inline">
                {userName}
              </span>
              <ChevronDown className="h-3.5 w-3.5 opacity-50" strokeWidth={2} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              {canSeeProfile ? (
              <DropdownMenuItem render={<Link href={profileHref} />}>
                <User className="h-4 w-4" strokeWidth={2} />
                {t("profile")}
              </DropdownMenuItem>
              ) : null}
              {canSeeNotifications ? (
              <DropdownMenuItem render={<Link href={notificationsHref} />}>
                <Bell className="h-4 w-4" strokeWidth={2} />
                {t("notifications")}
              </DropdownMenuItem>
              ) : null}
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
        </header>

        <main className="admin-app-canvas admin-main-enter min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
    </TooltipProvider>
  );
}
