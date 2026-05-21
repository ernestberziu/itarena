"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  LogOut,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBellBadge } from "@/components/shared/notification-count-badge";

export type AppShellMobileMenuItem = {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "destructive";
};

type AppShellMobileHeaderActionsProps = {
  searchLabel: string;
  onOpenSearch: () => void;
  notificationsHref: string;
  notificationsLabel: string;
  notificationCount: number;
  showNotifications: boolean;
  userInitials: string;
  userName: string;
  menuItems: AppShellMobileMenuItem[];
  logoutLabel: string;
  onLogout: () => void;
};

/** Mobile-only header toolbar: search + notifications + account (single top row). */
export function AppShellMobileHeaderActions({
  searchLabel,
  onOpenSearch,
  notificationsHref,
  notificationsLabel,
  notificationCount,
  showNotifications,
  userInitials,
  userName,
  menuItems,
  logoutLabel,
  onLogout,
}: AppShellMobileHeaderActionsProps) {
  return (
    <div className="ml-auto flex shrink-0 items-center gap-1 md:hidden">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-10 w-10 border-border/40 bg-background/80 p-0 shadow-none hover:bg-muted/60"
        onClick={onOpenSearch}
        aria-label={searchLabel}
      >
        <Search className="h-5 w-5 opacity-80" strokeWidth={2} />
      </Button>

      {showNotifications ? (
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "relative h-10 w-10 p-0 shadow-none",
            notificationCount > 0
              ? "border-amber-600/30 bg-accent/15 hover:bg-accent/25"
              : "border-border/40 bg-background/80 hover:bg-muted/60"
          )}
          asChild
        >
          <Link
            href={notificationsHref}
            className="relative inline-flex h-10 w-10 items-center justify-center"
            aria-label={
              notificationCount > 0
                ? `${notificationsLabel} (${notificationCount})`
                : notificationsLabel
            }
          >
            <Bell
              className={cn(
                "h-5 w-5 shrink-0",
                notificationCount > 0 && "text-[hsl(var(--brand-navy))]"
              )}
              strokeWidth={2}
            />
            <NotificationBellBadge count={notificationCount} />
          </Link>
        </Button>
      ) : null}

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className="h-10 gap-1 border-border/80 px-1.5 shadow-none"
              aria-label={userName}
            />
          }
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {userInitials}
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" strokeWidth={2} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[min(100vw-2rem,16rem)]">
          <div className="border-b border-border/60 px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
          </div>
          <DropdownMenuItem onClick={onOpenSearch}>
            <Search className="h-4 w-4" strokeWidth={2} />
            {searchLabel}
          </DropdownMenuItem>
          {menuItems.map((item) => {
            const Icon = item.icon;
            if (item.href) {
              return (
                <DropdownMenuItem
                  key={item.key}
                  variant={item.variant}
                  render={<Link href={item.href} />}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                  {item.label}
                </DropdownMenuItem>
              );
            }
            return (
              <DropdownMenuItem
                key={item.key}
                variant={item.variant}
                onClick={item.onClick}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                {item.label}
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={onLogout}>
            <LogOut className="h-4 w-4" strokeWidth={2} />
            {logoutLabel}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
