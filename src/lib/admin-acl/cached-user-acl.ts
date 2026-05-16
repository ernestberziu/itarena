import { cache } from "react";
import { db } from "@/lib/db";
import type { UserAclInput } from "./resolve";
import { resolveEffectiveAcl } from "./resolve";
import type { AdminFeature } from "./features";
import type { AclLevel } from "./features";

export const getCachedUserAclInput = cache(async (userId: string): Promise<UserAclInput | null> => {
  const row = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, adminAclJson: true },
  });
  if (!row) return null;
  return { role: row.role, adminAclJson: row.adminAclJson };
});

export const getCachedEffectiveAcl = cache(
  async (userId: string): Promise<Record<AdminFeature, AclLevel> | null> => {
    const input = await getCachedUserAclInput(userId);
    if (!input) return null;
    return resolveEffectiveAcl(input);
  }
);
