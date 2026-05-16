import type { Role } from "@/types/domain";
import { isStaff } from "@/types/domain";
import {
  ADMIN_FEATURES,
  type AdminFeature,
  type AclLevel,
  ROLE_DEFAULT_ACL,
  isStaffRole,
} from "./features";
import { parseAdminAclOverlay } from "./schema";

export type UserAclInput = {
  role: string;
  adminAclJson: unknown;
};

/** ADMIN always has full write on every feature (ignores JSON overlay for capability). */
export function resolveEffectiveAcl(user: UserAclInput): Record<AdminFeature, AclLevel> {
  const role = user.role as Role;

  if (role === "ADMIN") {
    return Object.fromEntries(ADMIN_FEATURES.map((f) => [f, "write" as const])) as Record<
      AdminFeature,
      AclLevel
    >;
  }

  if (!isStaffRole(user.role)) {
    return Object.fromEntries(ADMIN_FEATURES.map((f) => [f, "none" as const])) as Record<
      AdminFeature,
      AclLevel
    >;
  }

  const base = ROLE_DEFAULT_ACL[user.role];
  const overlay = parseAdminAclOverlay(user.adminAclJson);

  const out = { ...base } as Record<AdminFeature, AclLevel>;
  if (overlay) {
    for (const k of ADMIN_FEATURES) {
      if (overlay[k] !== undefined) out[k] = overlay[k]!;
    }
  }
  return out;
}

export function isStaffUser(user: UserAclInput): boolean {
  return isStaff(user.role as Role);
}
