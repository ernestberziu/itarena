// Domain type definitions (replaces Prisma enums — SQL Server doesn't support them)

export type Role =
  | "CLIENT"
  | "COMPANY_ADMIN"
  | "ENGINEER"
  | "SALES"
  | "OPS"
  | "ADMIN";

export type Tier = "RETAIL" | "B2B";

export type TicketStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "PAUSED"
  | "PENDING_CLIENT"
  | "RESOLVED"
  | "CLOSED";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELLED";

export type QuoteStatus =
  | "PENDING"
  | "REVIEWING"
  | "SENT"
  | "ACCEPTED"
  | "REJECTED"
  | "REVISION_REQUESTED";

export const STAFF_ROLES: Role[] = ["ADMIN", "ENGINEER", "SALES", "OPS"];

export function isStaff(role: Role): boolean {
  return STAFF_ROLES.includes(role);
}
