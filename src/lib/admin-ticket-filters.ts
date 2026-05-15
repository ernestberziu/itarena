/** Shared between server routes and client tables (do not put in `"use client"` files). */

export const ADMIN_TICKET_STATUS_OPTIONS = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "PAUSED",
  "PENDING_CLIENT",
  "RESOLVED",
  "CLOSED",
] as const;

export const ADMIN_TICKET_PRIORITY_OPTIONS = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;

export type AdminTicketStatusFilter = (typeof ADMIN_TICKET_STATUS_OPTIONS)[number];
export type AdminTicketPriorityFilter = (typeof ADMIN_TICKET_PRIORITY_OPTIONS)[number];
