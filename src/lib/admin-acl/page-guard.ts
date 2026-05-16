import { redirect } from "next/navigation";
import type { AdminFeature, AclLevel } from "./features";
import { hasAclLevel } from "./features";
import { resolveEffectiveAcl, type UserAclInput } from "./resolve";

export function requireAdminPageRead(
  locale: string,
  acl: Record<AdminFeature, AclLevel>,
  feature: AdminFeature,
  options?: { redirectTo?: string }
): void {
  if (!hasAclLevel(acl, feature, "read")) {
    redirect(options?.redirectTo ?? (locale === "en" ? "/en/admin/dashboard" : "/admin/dashboard"));
  }
}

export function requireAdminPageWrite(
  locale: string,
  acl: Record<AdminFeature, AclLevel>,
  feature: AdminFeature,
  options?: { redirectTo?: string }
): void {
  if (!hasAclLevel(acl, feature, "write")) {
    redirect(options?.redirectTo ?? (locale === "en" ? "/en/admin/dashboard" : "/admin/dashboard"));
  }
}

export function getAclFromUserRow(user: UserAclInput) {
  return resolveEffectiveAcl(user);
}
