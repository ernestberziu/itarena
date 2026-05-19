import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Ticket,
  Users,
  FileText,
  ShoppingBag,
  Package,
  UserCog,
  BarChart3,
  FileSignature,
  Settings,
  Bell,
  FolderKanban,
  MessageSquare,
  Calendar,
} from "lucide-react";
import type { Role } from "@/types/domain";

export type AdminNavItem = {
  id: string;
  transKey: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
};

export const MAIN_NAV: AdminNavItem[] = [
  {
    id: "dashboard",
    transKey: "dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "ENGINEER", "SALES", "OPS"],
  },
  {
    id: "notifications",
    transKey: "notifications",
    href: "/admin/notifications",
    icon: Bell,
    roles: ["ADMIN", "ENGINEER", "SALES", "OPS"],
  },
  {
    id: "tickets",
    transKey: "tickets",
    href: "/admin/tickets",
    icon: Ticket,
    roles: ["ADMIN", "ENGINEER"],
  },
  {
    id: "projects",
    transKey: "projects",
    href: "/admin/projects",
    icon: FolderKanban,
    roles: ["ADMIN", "ENGINEER", "SALES", "OPS", "PARTNER"],
  },
  {
    id: "messages",
    transKey: "messages",
    href: "/admin/messages",
    icon: MessageSquare,
    roles: ["ADMIN", "ENGINEER", "SALES", "OPS", "PARTNER"],
  },
  {
    id: "calendar",
    transKey: "calendar",
    href: "/admin/calendar",
    icon: Calendar,
    roles: ["ADMIN", "ENGINEER", "SALES", "OPS", "PARTNER"],
  },
  {
    id: "clients",
    transKey: "clients",
    href: "/admin/clients",
    icon: Users,
    roles: ["ADMIN", "SALES"],
  },
  {
    id: "quotes",
    transKey: "quotes",
    href: "/admin/quotes",
    icon: FileText,
    roles: ["ADMIN", "SALES"],
  },
  {
    id: "orders",
    transKey: "orders",
    href: "/admin/orders",
    icon: ShoppingBag,
    roles: ["ADMIN", "OPS"],
  },
  {
    id: "catalog",
    transKey: "catalog",
    href: "/admin/catalog",
    icon: Package,
    roles: ["ADMIN", "OPS"],
  },
  {
    id: "staff",
    transKey: "staff",
    href: "/admin/staff",
    icon: UserCog,
    roles: ["ADMIN"],
  },
  {
    id: "reports",
    transKey: "reports",
    href: "/admin/reports",
    icon: BarChart3,
    roles: ["ADMIN"],
  },
  {
    id: "templates",
    transKey: "templates",
    href: "/admin/templates",
    icon: FileSignature,
    roles: ["ADMIN", "SALES", "ENGINEER", "OPS"],
  },
  {
    id: "settings",
    transKey: "settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["ADMIN"],
  },
];

export const COMMERCE_NAV: {
  id: string;
  transKey: string;
  icon: LucideIcon;
  roles: Role[];
  path: "shopProducts" | "shopOrders" | "viewShop";
}[] = [];
