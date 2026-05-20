import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { STAFF_ROLES, type Role } from "@/types/domain";

export const PORTAL_ROLES = ["CLIENT", "COMPANY_ADMIN"] as const;
export type PortalRole = (typeof PORTAL_ROLES)[number];

export function isPortalRole(role: string | undefined): role is PortalRole {
  return PORTAL_ROLES.includes(role as PortalRole);
}

export function isCompanyAdmin(session: Session): boolean {
  return session.user.role === "COMPANY_ADMIN";
}

export function requirePortalUser(session: Session | null, locale: string): Session {
  if (!session?.user?.id) {
    redirect(locale === "en" ? "/en/hyr" : "/hyr");
  }
  if (STAFF_ROLES.includes(session.user.role as Role)) {
    redirect(locale === "en" ? "/en/admin" : "/admin");
  }
  if (!isPortalRole(session.user.role)) {
    redirect(locale === "en" ? "/en/hyr" : "/hyr");
  }
  return session;
}

export function requireCompanyAdminPage(session: Session, locale: string): void {
  if (!isCompanyAdmin(session)) {
    redirect(locale === "en" ? "/en/portal/dashboard" : "/portal/dashboard");
  }
}

export function requireCompanyId(session: Session, locale: string): string {
  requireCompanyAdminPage(session, locale);
  const companyId = session.user.companyId;
  if (!companyId) {
    redirect(locale === "en" ? "/en/portal/dashboard" : "/portal/dashboard");
  }
  return companyId;
}

export type PortalSessionUser = {
  id: string;
  role: PortalRole;
  companyId?: string | null;
};

export function portalUser(session: Session): PortalSessionUser {
  return {
    id: session.user.id,
    role: session.user.role as PortalRole,
    companyId: session.user.companyId ?? null,
  };
}

export type PortalTicketRef = {
  createdById: string;
  companyId: string | null;
};

export type PortalQuoteRef = {
  requestedById: string;
  companyId: string | null;
};

export function canViewPortalTicket(user: PortalSessionUser, ticket: PortalTicketRef): boolean {
  if (ticket.createdById === user.id) return true;
  if (user.role === "COMPANY_ADMIN" && user.companyId && ticket.companyId === user.companyId) {
    return true;
  }
  return false;
}

export function isPortalTicketOwner(user: PortalSessionUser, ticket: PortalTicketRef): boolean {
  return ticket.createdById === user.id;
}

export function canCommentOnPortalTicket(
  user: PortalSessionUser,
  ticket: PortalTicketRef & { status: string }
): boolean {
  if (!canViewPortalTicket(user, ticket)) return false;
  if (ticket.status === "CLOSED") return false;
  return true;
}

export function canAccessPortalQuote(user: PortalSessionUser, quote: PortalQuoteRef): boolean {
  if (quote.requestedById === user.id) return true;
  if (user.role === "COMPANY_ADMIN" && user.companyId && quote.companyId === user.companyId) {
    return true;
  }
  return false;
}
