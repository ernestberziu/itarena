import { db } from "@/lib/db";
import type { PortalSessionUser } from "@/lib/portal/access";
import { portalProjectClientWhere } from "@/lib/portal/scope";

export async function userHasProjectLinks(user: PortalSessionUser): Promise<boolean> {
  const count = await db.projectClient.count({
    where: portalProjectClientWhere(user),
  });
  return count > 0;
}

export async function assertPortalProjectAccess(
  user: PortalSessionUser,
  projectId: string
): Promise<boolean> {
  const link = await db.projectClient.findFirst({
    where: {
      projectId,
      ...portalProjectClientWhere(user),
    },
    select: { id: true },
  });
  return Boolean(link);
}

export async function listPortalProjectIds(user: PortalSessionUser): Promise<string[]> {
  const links = await db.projectClient.findMany({
    where: portalProjectClientWhere(user),
    select: { projectId: true },
  });
  return [...new Set(links.map((l) => l.projectId))];
}
