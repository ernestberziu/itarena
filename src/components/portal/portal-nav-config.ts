import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Ticket,
  ShoppingBag,
  FileText,
  Building2,
  Settings,
  Bell,
  FolderKanban,
  MessageSquare,
} from "lucide-react";
import type { PortalRole } from "@/lib/portal/access";

export type PortalNavItem = {
  id: string;
  transKey: string;
  href: string;
  icon: LucideIcon;
  roles: PortalRole[];
  /** Show only when user has at least one project link */
  requiresProjectLink?: boolean;
  /** Show only for company admins with a linked company */
  requiresCompanyId?: boolean;
};

export const PORTAL_MAIN_NAV: PortalNavItem[] = [
  {
    id: "dashboard",
    transKey: "dashboard",
    href: "/portal/dashboard",
    icon: LayoutDashboard,
    roles: ["CLIENT", "COMPANY_ADMIN"],
  },
  {
    id: "tickets",
    transKey: "my_tickets",
    href: "/portal/tickets",
    icon: Ticket,
    roles: ["CLIENT", "COMPANY_ADMIN"],
  },
  {
    id: "orders",
    transKey: "orders",
    href: "/portal/orders",
    icon: ShoppingBag,
    roles: ["CLIENT", "COMPANY_ADMIN"],
  },
  {
    id: "quotes",
    transKey: "quotes",
    href: "/portal/quotes",
    icon: FileText,
    roles: ["COMPANY_ADMIN"],
    requiresCompanyId: true,
  },
  {
    id: "company",
    transKey: "company",
    href: "/portal/company",
    icon: Building2,
    roles: ["COMPANY_ADMIN"],
    requiresCompanyId: true,
  },
  {
    id: "projects",
    transKey: "projects",
    href: "/portal/projects",
    icon: FolderKanban,
    roles: ["CLIENT", "COMPANY_ADMIN"],
    requiresProjectLink: true,
  },
  {
    id: "messages",
    transKey: "messages",
    href: "/portal/messages",
    icon: MessageSquare,
    roles: ["CLIENT", "COMPANY_ADMIN"],
  },
  {
    id: "notifications",
    transKey: "notifications",
    href: "/portal/notifications",
    icon: Bell,
    roles: ["CLIENT", "COMPANY_ADMIN"],
  },
  {
    id: "settings",
    transKey: "settings",
    href: "/portal/settings",
    icon: Settings,
    roles: ["CLIENT", "COMPANY_ADMIN"],
  },
];

export type PortalNavContext = {
  role: PortalRole;
  hasProjectLinks: boolean;
  hasCompanyId: boolean;
};

export function filterPortalNav(
  items: PortalNavItem[],
  ctx: PortalNavContext
): PortalNavItem[] {
  return items.filter((item) => {
    if (!item.roles.includes(ctx.role)) return false;
    if (item.requiresProjectLink && !ctx.hasProjectLinks) return false;
    if (item.requiresCompanyId && !ctx.hasCompanyId) return false;
    return true;
  });
}
