import type { AdminFeature } from "@/lib/admin-acl/features";

export const NOTIFICATION_CATEGORIES = [
  "TICKET",
  "PROJECT",
  "ORDER",
  "QUOTE",
  "MESSAGE",
  "CLIENT",
  "COMPANY",
  "STAFF",
  "SHOP",
  "SECURITY",
  "SYSTEM",
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export const NOTIFICATION_SEVERITIES = ["info", "action", "urgent"] as const;
export type NotificationSeverity = (typeof NOTIFICATION_SEVERITIES)[number];

export const NOTIFICATION_EVENT_TYPES = [
  "TICKET_CREATED",
  "TICKET_ASSIGNED",
  "TICKET_STATUS_CHANGED",
  "TICKET_COMMENT_ADDED",
  "TICKET_SLA_BREACHED",
  "PROJECT_CREATED",
  "PROJECT_UPDATED",
  "PROJECT_CLIENT_LINKED",
  "PROJECT_STEP_UPDATED",
  "PROJECT_MESSAGE_ADDED",
  "CONVERSATION_MESSAGE_ADDED",
  "ORDER_PLACED",
  "ORDER_STATUS_CHANGED",
  "QUOTE_SUBMITTED",
  "QUOTE_STATUS_CHANGED",
  "SHOP_QUOTE_SUBMITTED",
  "CLIENT_INVITED",
  "CLIENT_ACCOUNT_UPDATED",
  "COMPANY_MEMBER_ADDED",
  "STAFF_ACL_CHANGED",
  "STAFF_REMOVED",
  "PUBLIC_SHARE_GUEST_COMMENT",
  "CONTACT_FORM_SUBMITTED",
  "USER_REGISTERED",
  "PASSWORD_CHANGED",
] as const;

export type NotificationEventType = (typeof NOTIFICATION_EVENT_TYPES)[number];

export type EntityRef = {
  type: string;
  id: string;
};

export type NotificationPayload = Record<string, unknown>;

export type EmitNotificationInput = {
  type: NotificationEventType;
  actorId?: string | null;
  excludeActor?: boolean;
  entity?: EntityRef;
  payload?: NotificationPayload;
  dedupeKey?: string;
  link?: string;
  /** Override resolved recipient IDs (rare). */
  recipientIds?: string[];
  /** Skip notification email (e.g. credentials email already sent in same request). */
  skipEmail?: boolean;
};

export type ResolvedNotification = {
  userId: string;
  type: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  titleEn: string;
  body: string;
  bodyEn: string;
  link: string | null;
  entityType: string | null;
  entityId: string | null;
  actorId: string | null;
  metadata: NotificationPayload | null;
  dedupeKey: string | null;
};

export type CatalogEntry = {
  category: NotificationCategory;
  severity: NotificationSeverity;
  aclFeature?: AdminFeature;
  excludeActor?: boolean;
  resolveRecipients: (input: EmitNotificationInput) => Promise<string[]>;
};
