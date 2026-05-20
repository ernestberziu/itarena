import type { Role } from "@/types/domain";
import {
  ADMIN_FEATURES,
  type AdminFeature,
  type AclLevel,
  hasAclLevel,
} from "./features";
import { MAIN_NAV, COMMERCE_NAV, type AdminNavItem } from "@/components/admin/admin-nav-config";

export function adminLocalePrefix(locale: string): string {
  return locale === "en" ? "/en" : "";
}

/** Staff landing route based on effective ACL. */
export function resolveStaffHomeHref(
  locale: string,
  acl: Record<AdminFeature, AclLevel>
): string {
  const lp = adminLocalePrefix(locale);
  if (hasAclLevel(acl, "dashboard", "read")) {
    return `${lp}/admin/dashboard`;
  }
  return `${lp}/admin/profile`;
}

export type StaffQuickLink = {
  id: AdminFeature;
  href: string;
  transKey: string;
  icon: AdminNavItem["icon"];
};

const QUICK_LINK_SKIP: AdminFeature[] = ["profile"];

/** Nav destinations the user can access (for profile dashboard quick links). */
export function getStaffQuickLinks(
  locale: string,
  acl: Record<AdminFeature, AclLevel>,
  role: Role
): StaffQuickLink[] {
  const lp = adminLocalePrefix(locale);
  const out: StaffQuickLink[] = [];

  for (const item of MAIN_NAV) {
    if (!item.roles.includes(role)) continue;
    if (QUICK_LINK_SKIP.includes(item.id as AdminFeature)) continue;
    const feature = item.id as AdminFeature;
    if (!hasAclLevel(acl, feature, "read")) continue;
    out.push({
      id: feature,
      href: `${lp}${item.href}`,
      transKey: item.transKey,
      icon: item.icon,
    });
  }

  for (const item of COMMERCE_NAV) {
    if (!item.roles.includes(role)) continue;
    const feature = item.id as AdminFeature;
    if (!hasAclLevel(acl, feature, "read")) continue;
    out.push({
      id: feature,
      href: `${lp}/admin/${item.path === "shopProducts" ? "shop/products" : item.path === "shopOrders" ? "shop/orders" : "shop"}`,
      transKey: item.transKey,
      icon: item.icon,
    });
  }

  return out;
}

export type PermissionSummaryRow = {
  feature: AdminFeature;
  label: string;
  level: AclLevel;
};

export function aclFeatureLabel(feature: AdminFeature, locale: string): string {
  const en = locale === "en";
  const t = (sq: string, e: string) => (en ? e : sq);
  switch (feature) {
    case "dashboard":
      return t("Paneli", "Dashboard");
    case "notifications":
      return t("Njoftimet", "Notifications");
    case "tickets":
      return t("Biletat", "Tickets");
    case "projects":
      return t("Projektet", "Projects");
    case "messages":
      return t("Mesazhet", "Messages");
    case "calendar":
      return t("Kalendari", "Calendar");
    case "clients":
      return t("Klientët", "Clients");
    case "companies":
      return t("Kompanitë", "Companies");
    case "quotes":
      return t("Ofertat", "Quotes");
    case "orders":
      return t("Porositë", "Orders");
    case "catalog":
      return t("Katalog", "Catalog");
    case "staff":
      return t("Stafi", "Staff");
    case "reports":
      return t("Raportet", "Reports");
    case "templates":
      return t("Shabllonet", "Templates");
    case "settings":
      return t("Cilësimet", "Settings");
    case "shop_products":
      return t("Produkte dyqani", "Shop products");
    case "shop_orders":
      return t("Porosi dyqani", "Shop orders");
    case "view_shop":
      return t("Shiko dyqanin", "View shop");
    case "profile":
      return t("Profili", "Profile");
    default:
      return feature;
  }
}

export function aclLevelLabel(level: AclLevel, locale: string): string {
  const en = locale === "en";
  const t = (sq: string, e: string) => (en ? e : sq);
  switch (level) {
    case "write":
      return t("Shkrim", "Write");
    case "read":
      return t("Lexim", "Read");
    default:
      return t("Pa qasje", "No access");
  }
}

/** Effective permissions for the read-only summary card (non-none only). */
export function getEffectivePermissionSummary(
  acl: Record<AdminFeature, AclLevel>,
  locale: string
): PermissionSummaryRow[] {
  return ADMIN_FEATURES.filter((f) => acl[f] !== "none").map((feature) => ({
    feature,
    label: aclFeatureLabel(feature, locale),
    level: acl[feature],
  }));
}
