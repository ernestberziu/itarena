import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { loadUserAclRow } from "@/lib/admin-acl/guards";
import { hasAclLevel } from "@/lib/admin-acl/features";
import { resolveEffectiveAcl } from "@/lib/admin-acl/resolve";
import type { ProjectAccess } from "./types";

const ACCESS_RANK: Record<ProjectAccess, number> = {
  read: 1,
  write: 2,
  admin: 3,
};

export function projectAccessRank(access: string): number {
  return ACCESS_RANK[access as ProjectAccess] ?? 0;
}

export function hasProjectAccessLevel(memberAccess: string, min: ProjectAccess): boolean {
  return projectAccessRank(memberAccess) >= projectAccessRank(min);
}

export async function isAdminUser(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  return user?.role === "ADMIN";
}

export async function getProjectMembership(
  userId: string,
  projectId: string
): Promise<{ access: ProjectAccess } | null> {
  const row = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    select: { access: true },
  });
  if (!row) return null;
  return { access: row.access as ProjectAccess };
}

/** Project IDs the user may access (read+). ADMIN returns null = unrestricted. */
export async function listAccessibleProjectIds(userId: string): Promise<string[] | null> {
  if (await isAdminUser(userId)) return null;

  const aclRow = await loadUserAclRow(userId);
  if (!aclRow) return [];
  const acl = resolveEffectiveAcl(aclRow);
  if (!hasAclLevel(acl, "projects", "read")) return [];

  const members = await db.projectMember.findMany({
    where: { userId },
    select: { projectId: true },
  });
  const created = await db.project.findMany({
    where: { createdById: userId },
    select: { id: true },
  });
  const ids = new Set([...members.map((m) => m.projectId), ...created.map((p) => p.id)]);
  return [...ids];
}

export async function canAccessProject(
  userId: string,
  projectId: string,
  min: ProjectAccess = "read"
): Promise<boolean> {
  if (await isAdminUser(userId)) return true;

  const aclRow = await loadUserAclRow(userId);
  if (!aclRow) return false;
  const acl = resolveEffectiveAcl(aclRow);
  const globalMin = min === "admin" ? "write" : min;
  if (!hasAclLevel(acl, "projects", globalMin)) return false;

  const membership = await getProjectMembership(userId, projectId);
  if (!membership) return false;
  return hasProjectAccessLevel(membership.access, min);
}

export async function assertProjectAccess(
  userId: string,
  projectId: string,
  min: ProjectAccess = "read"
): Promise<NextResponse | null> {
  const ok = await canAccessProject(userId, projectId, min);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return null;
}

export async function canManageProjectMembers(
  userId: string,
  projectId: string
): Promise<boolean> {
  if (await isAdminUser(userId)) return true;
  const membership = await getProjectMembership(userId, projectId);
  return membership ? hasProjectAccessLevel(membership.access, "admin") : false;
}
