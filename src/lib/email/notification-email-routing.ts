import "server-only";
import type { NotificationEventType } from "@/lib/notifications/types";

/** Always deliver to the user's own mailbox (security / credentials). */
const PERSONAL_EMAIL_ONLY_TYPES: NotificationEventType[] = [
  "PASSWORD_CHANGED",
  "CLIENT_INVITED",
  "CLIENT_ACCOUNT_UPDATED",
  "STAFF_ACL_CHANGED",
];

export function shouldUseOpsNotifyInbox(
  role: string,
  type: NotificationEventType,
): boolean {
  if (role !== "ADMIN") return false;
  if (PERSONAL_EMAIL_ONLY_TYPES.includes(type)) return false;
  return true;
}
