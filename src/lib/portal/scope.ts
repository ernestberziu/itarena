import type { Prisma } from "@prisma/client";
import type { PortalSessionUser } from "@/lib/portal/access";

export function portalTicketWhere(user: PortalSessionUser): Prisma.TicketWhereInput {
  if (isCompanyAdminRole(user) && user.companyId) {
    return { companyId: user.companyId };
  }
  return { createdById: user.id };
}

export function portalOrderWhere(user: PortalSessionUser): Prisma.OrderWhereInput {
  if (isCompanyAdminRole(user) && user.companyId) {
    return { companyId: user.companyId };
  }
  return { userId: user.id };
}

export function portalQuoteWhere(user: PortalSessionUser): Prisma.QuoteWhereInput {
  if (isCompanyAdminRole(user) && user.companyId) {
    return { companyId: user.companyId };
  }
  return { requestedById: user.id };
}

export function portalNotificationWhere(userId: string): Prisma.NotificationWhereInput {
  return { userId };
}

export function portalProjectClientWhere(user: PortalSessionUser): Prisma.ProjectClientWhereInput {
  if (isCompanyAdminRole(user) && user.companyId) {
    return {
      OR: [{ userId: user.id }, { companyId: user.companyId }],
    };
  }
  return { userId: user.id };
}

function isCompanyAdminRole(user: PortalSessionUser): boolean {
  return user.role === "COMPANY_ADMIN";
}

export function portalUsesCompanyScope(user: PortalSessionUser): boolean {
  return isCompanyAdminRole(user) && Boolean(user.companyId);
}
