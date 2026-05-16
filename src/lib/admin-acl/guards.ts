import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { AdminFeature } from "./features";
import { hasAclLevel } from "./features";
import { resolveEffectiveAcl, type UserAclInput } from "./resolve";

export async function loadUserAclRow(userId: string): Promise<UserAclInput | null> {
  const row = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, adminAclJson: true },
  });
  if (!row) return null;
  return { role: row.role, adminAclJson: row.adminAclJson };
}

/** Returns 403 JSON if the signed-in user lacks ACL; otherwise null. */
export async function assertAdminApiAcl(
  userId: string,
  feature: AdminFeature,
  min: "read" | "write"
): Promise<NextResponse | null> {
  const row = await loadUserAclRow(userId);
  if (!row) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const acl = resolveEffectiveAcl(row);
  if (!hasAclLevel(acl, feature, min)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
