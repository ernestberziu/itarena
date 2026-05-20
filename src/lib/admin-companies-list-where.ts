import type { Prisma } from "@prisma/client";

export type AdminCompaniesListQuery = {
  q?: string | null;
};

export function adminCompaniesListWhere(input: AdminCompaniesListQuery): Prisma.CompanyWhereInput {
  const q = input.q?.trim();

  return {
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { vatNumber: { contains: q } },
            { city: { contains: q } },
          ],
        }
      : {}),
  };
}
