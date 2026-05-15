"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Ticket,
  ShoppingBag,
  FileText,
  Building2,
  Settings,
  Bell,
  LogOut,
  Plus,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ItArenaLogo } from "@/components/brand/logo";
import { CommandMenu, useCommandMenu } from "@/components/shared/command-menu";
import type { Role } from "@/types/domain";
import * as React from "react";

interface SidebarProps {
  userRole: Role;
  userInitials: string;
  userName: string;
  unreadNotifications?: number;
}

function SidebarContent({
  userRole,
  userInitials,
  userName,
  unreadNotifications = 0,
  onNavigate,
}: SidebarProps & { onNavigate?: () => void }) {
  const t = useTranslations("portal");
  const tNav = useTranslations("nav");
  const pathname = usePathname();
  const locale = useLocale();
  const lp = locale === "sq" ? "" : `/${locale}`;
  const { open, setOpen } = useCommandMenu();

  const navItems = [
    { label: t("dashboard"), href: `${lp}/portal/dashboard`, icon: LayoutDashboard },
    { label: t("my_tickets"), href: `${lp}/portal/tickets`, icon: Ticket },
    { label: t("orders"), href: `${lp}/portal/orders`, icon: ShoppingBag },
    ...(["COMPANY_ADMIN", "B2B"].includes(userRole)
      ? [
          { label: t("quotes"), href: `${lp}/portal/quotes`, icon: FileText },
          { label: t("company"), href: `${lp}/portal/company`, icon: Building2 },
        ]
      : []),
    {
      label: t("notifications"),
      href: `${lp}/portal/notifications`,
      icon: Bell,
      badge: unreadNotifications,
    },
    { label: t("settings"), href: `${lp}/portal/settings`, icon: Settings },
  ];

  return (
    <div className="flex h-full flex-col bg-[hsl(222,47%,9%)] text-white">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-white/10 px-4">
        <ItArenaLogo variant="dark" size="sm" />
      </div>

      {/* New Ticket CTA */}
      <div className="px-3 py-3 border-b border-white/10">
        <Button asChild size="sm" className="w-full justify-start gap-2 text-xs">
          <Link href={`${lp}/portal/tickets/new`} onClick={onNavigate}>
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            {t("new_ticket")}
          </Link>
        </Button>
      </div>

      {/* Command search */}
      <div className="px-3 py-2.5 border-b border-white/10">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-2.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/40 hover:bg-white/10 hover:text-white/70 transition-colors"
        >
          <span className="flex-1 text-left">Kërko...</span>
          <kbd className="hidden sm:inline-flex items-center text-[10px] border border-white/20 rounded px-1.5 py-0.5 bg-white/5">
            ⌘K
          </kbd>
        </button>
        <CommandMenu open={open} onOpenChange={setOpen} mode="portal" />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/50 hover:bg-white/8 hover:text-white/80"
              )}
            >
              <Icon
                className="h-4 w-4 shrink-0"
                strokeWidth={2}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold px-1">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/10 px-3 py-3 space-y-2">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2 bg-white/5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{userName}</p>
            <p className="text-xs text-white/40 capitalize">
              {userRole.toLowerCase().replace("_", " ")}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 border-transparent bg-transparent text-white/50 shadow-none hover:bg-white/10 hover:text-white text-xs"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
          {tNav("logout")}
        </Button>
      </div>
    </div>
  );
}

export function PortalSidebar(props: SidebarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex h-full w-60 shrink-0 flex-col">
        <SidebarContent {...props} />
      </aside>

      {/* Mobile top bar + sheet */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center gap-3 bg-[hsl(222,47%,9%)] border-b border-white/10 px-4">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 border-transparent bg-transparent p-0 text-white/60 shadow-none hover:bg-white/10 hover:text-white"
              />
            }
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 border-r-0">
            <SidebarContent {...props} onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
        <ItArenaLogo variant="dark" size="sm" />
      </div>
    </>
  );
}
