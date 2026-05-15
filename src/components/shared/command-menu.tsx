"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
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
  Plus,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";
import { crossAppAdminHref } from "@/components/admin/admin-href";

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "admin" | "portal";
  /** When admin panel runs on shop host, resolve main-app links absolutely */
  adminContext?: "locale" | "shop";
  adminLocale?: "sq" | "en";
}

const adminNav = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Njoftimet", href: "/admin/notifications", icon: Bell },
  { label: "Biletat", href: "/admin/tickets", icon: Ticket },
  { label: "Klientët", href: "/admin/clients", icon: Users },
  { label: "Ofertat", href: "/admin/quotes", icon: FileText },
  { label: "Porositë", href: "/admin/orders", icon: ShoppingBag },
  { label: "Katalog", href: "/admin/catalog", icon: Package },
  { label: "Stafi", href: "/admin/staff", icon: UserCog },
  { label: "Raportet", href: "/admin/reports", icon: BarChart3 },
  { label: "Cilësimet", href: "/admin/settings", icon: Settings },
];

const portalNav = [
  { label: "Dashboard", href: "/portal/dashboard", icon: LayoutDashboard },
  { label: "Biletat e Mia", href: "/portal/tickets", icon: Ticket },
  { label: "Porositë", href: "/portal/orders", icon: ShoppingBag },
  { label: "Ofertat", href: "/portal/quotes", icon: FileText },
  { label: "Njoftimet", href: "/portal/notifications", icon: Search },
  { label: "Cilësimet", href: "/portal/settings", icon: Settings },
];

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
}: CommandMenuProps) {
  const router = useRouter();
  const locale = useLocale();
  const lp = locale === "sq" ? "" : `/${locale}`;
  const effectiveAdminLocale =
    adminLocale === "en" ? "en" : locale === "en" ? "en" : "sq";

  const nav = mode === "admin" ? adminNav : portalNav;

  function go(href: string) {
    if (mode === "admin") {
      const resolved = crossAppAdminHref(
        adminContext,
        effectiveAdminLocale,
        href
      );
      if (resolved.startsWith("http://") || resolved.startsWith("https://")) {
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
                    placeholder="Kërko faqe, biletë, klient..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    autoFocus
                  />
                </div>
                <kbd className={cn(kbdChip, "hidden shrink-0 sm:inline-flex")}>Esc</kbd>
              </div>
              <CommandList className="max-h-[min(18rem,50vh)] overflow-y-auto px-1.5 py-2">
                <CommandEmpty className="py-10 text-center text-sm text-muted-foreground">
                  Nuk u gjet asgjë.
                </CommandEmpty>
                <CommandGroup heading="Navigim" className={groupHeadingClass}>
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
                    <CommandGroup heading="Veprime" className={groupHeadingClass}>
                      <CommandItem
                        value="biletë e re"
                        onSelect={() => go("/portal/tickets/new")}
                        className={itemClass}
                      >
                        <Plus className="h-4 w-4 text-muted-foreground" />
                        Hap biletë të re
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
                {mode === "admin" && (
                  <>
                    <CommandSeparator className="my-1.5 h-px bg-border/70" />
                    <CommandGroup heading="Veprime" className={groupHeadingClass}>
                      <CommandItem
                        value="biletë e re admin"
                        onSelect={() => go("/admin/tickets/new")}
                        className={itemClass}
                      >
                        <Plus className="h-4 w-4 text-muted-foreground" />
                        Hap biletë të re
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border/50 bg-muted/10 px-4 py-2.5 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <kbd className={kbdChip}>↑↓</kbd>
                  lëviz
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className={kbdChip}>↵</kbd>
                  zgjidh
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className={kbdChip}>Esc</kbd>
                  mbyll
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
