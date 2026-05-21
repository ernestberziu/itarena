import "server-only";
import type { NotificationEventType } from "@/lib/notifications/types";

/**
 * Security / credential emails always go to the user's own mailbox.
 */
const PERSONAL_EMAIL_ONLY_TYPES: NotificationEventType[] = [
  "PASSWORD_CHANGED",
  "CLIENT_INVITED",
  "CLIENT_ACCOUNT_UPDATED",
  "STAFF_ACL_CHANGED",
];

/**
 * ADMIN users: notification email goes to NOTIFY_EMAIL (deduped).
 * Other staff (SALES, ENGINEER, …) and portal clients use their own email.
 */
export function shouldUseOpsNotifyInbox(
  role: string,
  type: NotificationEventType,
): boolean {
  if (role !== "ADMIN") return false;
  if (PERSONAL_EMAIL_ONLY_TYPES.includes(type)) return false;
  return true;
}
