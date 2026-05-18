import type { Prisma } from "@prisma/client";
import { listAccessibleProjectIds } from "./access";

export type ProjectsListQuery = {
  q?: string | null;
  status?: string | null;
};

export async function projectsListWhere(
  userId: string,
  input: ProjectsListQuery
): Promise<Prisma.ProjectWhereInput> {
  const where: Prisma.ProjectWhereInput = {};
  const accessibleIds = await listAccessibleProjectIds(userId);

  if (accessibleIds !== null) {
    if (accessibleIds.length === 0) {
      where.id = { in: [] };
    } else {
      where.id = { in: accessibleIds };
    }
  }

  const status = input.status?.trim();
  if (status === "ACTIVE" || status === "ARCHIVED") {
    where.status = status;
  }

  const q = input.q?.trim();
  if (q) {
    where.OR = [{ title: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }];
  }

  return where;
}

export const projectListInclude = {
  createdBy: { select: { firstName: true, lastName: true } },
  _count: {
    select: { tickets: true, messages: true, members: true, clients: true },
  },
} as const;

export const projectDetailInclude = {
  createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
  members: {
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
    },
    orderBy: { createdAt: "asc" as const },
  },
  clients: {
    include: {
      company: { select: { id: true, name: true } },
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
    orderBy: { createdAt: "asc" as const },
  },
} as const;
