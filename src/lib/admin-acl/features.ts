import type { Role } from "@/types/domain";
import { STAFF_ROLES } from "@/types/domain";

/** Non-client staff roles (subset of `Role`). */
export type StaffRole = Extract<Role, "ADMIN" | "ENGINEER" | "SALES" | "OPS" | "PARTNER">;

/** Keys align with `admin-nav-config` ids plus `profile` (always available in admin shell). */
export const ADMIN_FEATURES = [
  "dashboard",
  "notifications",
  "tickets",
  "projects",
  "messages",
  "clients",
  "quotes",
  "orders",
  "catalog",
  "staff",
  "reports",
  "templates",
  "settings",
  "shop_products",
  "shop_orders",
  "view_shop",
  "profile",
] as const;

export type AdminFeature = (typeof ADMIN_FEATURES)[number];

export type AclLevel = "none" | "read" | "write";

const W: AclLevel = "write";
const R: AclLevel = "read";
const N: AclLevel = "none";

function allNone(): Record<AdminFeature, AclLevel> {
  return Object.fromEntries(ADMIN_FEATURES.map((f) => [f, N])) as Record<AdminFeature, AclLevel>;
}

function mergeDefaults(partial: Partial<Record<AdminFeature, AclLevel>>): Record<AdminFeature, AclLevel> {
  const base = allNone();
  for (const f of ADMIN_FEATURES) {
    if (partial[f] !== undefined) base[f] = partial[f]!;
  }
  return base;
}

function allWrite(): Record<AdminFeature, AclLevel> {
  return Object.fromEntries(ADMIN_FEATURES.map((f) => [f, W])) as Record<AdminFeature, AclLevel>;
}

/** Mirrors current nav + API behavior before per-user `adminAclJson` overrides. */
export const ROLE_DEFAULT_ACL: Record<StaffRole, Record<AdminFeature, AclLevel>> = {
  ADMIN: allWrite(),
  ENGINEER: mergeDefaults({
    dashboard: W,
    notifications: W,
    tickets: W,
    projects: R,
    messages: W,
    templates: R,
    view_shop: W,
    profile: W,
  }),
  PARTNER: mergeDefaults({
    dashboard: R,
    projects: W,
    messages: R,
    profile: W,
  }),
  SALES: mergeDefaults({
    dashboard: W,
    notifications: W,
    tickets: W,
    messages: W,
    clients: W,
    quotes: W,
    templates: W,
    view_shop: W,
    profile: W,
  }),
  OPS: mergeDefaults({
    dashboard: W,
    notifications: W,
    tickets: W,
    messages: W,
    orders: W,
    catalog: W,
    shop_products: W,
    shop_orders: W,
    templates: R,
    view_shop: W,
    profile: W,
  }),
};

export function isStaffRole(role: string): role is StaffRole {
  return STAFF_ROLES.includes(role as Role);
}

export function aclRank(level: AclLevel): number {
  switch (level) {
    case "write":
      return 2;
    case "read":
      return 1;
    default:
      return 0;
  }
}

export function hasAclLevel(
  effective: Record<AdminFeature, AclLevel>,
  feature: AdminFeature,
  min: "read" | "write"
): boolean {
  return aclRank(effective[feature]) >= aclRank(min);
}
