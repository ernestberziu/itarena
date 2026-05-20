import type { Prisma } from "@prisma/client";
import { STAFF_ROLES } from "@/types/domain";

export function activeStaffWhere(): Prisma.UserWhereInput {
  return {
    role: { in: [...STAFF_ROLES] },
    deletedAt: null,
  };
}

export function activeStaffMemberWhere(): Prisma.UserWhereInput {
  return {
    ...activeStaffWhere(),
    isActive: true,
  };
}
