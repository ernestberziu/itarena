import { redirect } from "next/navigation";
import type { AdminFeature, AclLevel } from "./features";
import { hasAclLevel } from "./features";
import { resolveEffectiveAcl, type UserAclInput } from "./resolve";
import { resolveStaffHomeHref } from "./staff-home";

export function requireAdminPageRead(
  locale: string,
  acl: Record<AdminFeature, AclLevel>,
  feature: AdminFeature,
  options?: { redirectTo?: string }
): void {
  if (!hasAclLevel(acl, feature, "read")) {
    redirect(options?.redirectTo ?? resolveStaffHomeHref(locale, acl));
  }
}

export function requireAdminPageWrite(
  locale: string,
  acl: Record<AdminFeature, AclLevel>,
  feature: AdminFeature,
  options?: { redirectTo?: string }
): void {
  if (!hasAclLevel(acl, feature, "write")) {
    redirect(options?.redirectTo ?? resolveStaffHomeHref(locale, acl));
  }
}

export function getAclFromUserRow(user: UserAclInput) {
  return resolveEffectiveAcl(user);
}
