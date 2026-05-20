import { STAFF_ROLES, type Role } from "@/types/domain";

export const PORTAL_BRAND_NAME = "IT Arena";

export function isPortalStaffRole(role: string): boolean {
  return STAFF_ROLES.includes(role as Role);
}

export function portalAuthorDisplayName(
  author: { id?: string; firstName: string; lastName: string; role: string },
  viewerUserId?: string,
  locale: "sq" | "en" = "sq"
): string {
  if (isPortalStaffRole(author.role)) return PORTAL_BRAND_NAME;
  if (viewerUserId && author.id === viewerUserId) {
    return locale === "sq" ? "Ju" : "You";
  }
  return `${author.firstName} ${author.lastName}`.trim();
}

/** Ticket requester line for portal — staff-opened tickets always show IT Arena. */
export function portalTicketOpenedByLabel(
  createdBy: { firstName: string; lastName: string; role: string },
  _locale: "sq" | "en" = "sq"
): string {
  if (isPortalStaffRole(createdBy.role)) return PORTAL_BRAND_NAME;
  return `${createdBy.firstName} ${createdBy.lastName}`.trim();
}

export function isPortalClientRole(role: string): boolean {
  return role === "CLIENT" || role === "COMPANY_ADMIN";
}

export function portalAuthorInitials(
  author: { id?: string; firstName: string; lastName: string; role: string },
  viewerUserId?: string
): string {
  if (isPortalStaffRole(author.role)) return "IA";
  if (viewerUserId && author.id === viewerUserId) {
    return (author.firstName[0] ?? "J").toUpperCase();
  }
  const f = author.firstName[0] ?? "";
  const l = author.lastName[0] ?? "";
  return (f + l).toUpperCase() || "?";
}
