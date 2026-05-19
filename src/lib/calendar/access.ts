import type { Role } from "@/types/domain";

export function isCalendarAdmin(role: string): boolean {
  return role === "ADMIN";
}

export function canViewStaffReport(viewerRole: string, viewerId: string, reportUserId: string): boolean {
  if (viewerId === reportUserId) return true;
  return isCalendarAdmin(viewerRole);
}

export function canReplyToReport(role: string): boolean {
  return isCalendarAdmin(role);
}

export function canSubmitReportForDate(
  userId: string,
  authorId: string,
  isFuture: boolean
): boolean {
  if (isFuture) return false;
  return userId === authorId;
}

export type CalendarSessionUser = {
  id: string;
  role: Role;
};
