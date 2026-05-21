import type { Prisma } from "@prisma/client";

export type AdminClientsListQuery = {
  q?: string | null;
  tier?: string | null;
  approved?: string | null;
  /** all | active | suspended */
  active?: string | null;
  /** all | linked | individual */
  affiliation?: string | null;
  /** all | invited | pending */
  portalAccess?: string | null;
};

/** URL-driven filters for the admin clients list (matches GET /api/admin/clients tier/approved semantics). */
export function adminClientsListWhere(input: AdminClientsListQuery): Prisma.UserWhereInput {
  const q = input.q?.trim();
  const tier = input.tier?.trim();
  const approved = input.approved?.trim();
  const active = input.active?.trim() || "all";
  const affiliation = input.affiliation?.trim() || "all";
  const portalAccess = input.portalAccess?.trim() || "all";

  const companyWhere: Prisma.CompanyWhereInput = {};
  if (tier === "B2B" || tier === "RETAIL") {
    companyWhere.tier = tier;
  }
  if (approved === "true") {
    companyWhere.isApproved = true;
  }
  if (approved === "false") {
    companyWhere.isApproved = false;
  }

  const where: Prisma.UserWhereInput = {
    role: { in: ["CLIENT", "COMPANY_ADMIN"] },
    ...(Object.keys(companyWhere).length > 0 ? { company: companyWhere } : {}),
    ...(q
      ? {
          OR: [
            { firstName: { contains: q } },
            { lastName: { contains: q } },
            { email: { contains: q } },
            { phone: { contains: q } },
          ],
        }
      : {}),
    ...(active === "active" ? { isActive: true } : active === "suspended" ? { isActive: false } : {}),
    ...(affiliation === "linked" ? { companyId: { not: null } } : affiliation === "individual" ? { companyId: null } : {}),
    ...(portalAccess === "invited"
      ? { email: { not: null }, passwordHash: { not: null } }
      : portalAccess === "pending"
        ? { OR: [{ email: null }, { passwordHash: null }] }
        : {}),
  };

  return where;
}
