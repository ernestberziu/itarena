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
  Settings,
  Store,
  Bell,
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
}[] = [
  {
    id: "shop_products",
    transKey: "shop_products",
    icon: Package,
    roles: ["ADMIN", "OPS"],
    path: "shopProducts",
  },
  {
    id: "shop_orders",
    transKey: "shop_orders",
    icon: ShoppingBag,
    roles: ["ADMIN", "OPS"],
    path: "shopOrders",
  },
  {
    id: "view_shop",
    transKey: "view_shop",
    icon: Store,
    roles: ["ADMIN", "ENGINEER", "SALES", "OPS"],
    path: "viewShop",
  },
];
