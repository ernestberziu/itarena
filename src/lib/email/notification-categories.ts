import type { EmailLocale } from "@/lib/email/brand";
import type { NotificationEventType } from "@/lib/notifications/types";

export function notificationCategoryLabel(
  type: NotificationEventType,
  locale: EmailLocale,
): string {
  const en = locale === "en";
  switch (type) {
    case "TICKET_CREATED":
    case "TICKET_ASSIGNED":
    case "TICKET_STATUS_CHANGED":
    case "TICKET_COMMENT_ADDED":
    case "TICKET_SLA_BREACHED":
    case "PUBLIC_SHARE_GUEST_COMMENT":
      return en ? "Ticket" : "Biletë";
    case "PROJECT_CREATED":
    case "PROJECT_UPDATED":
    case "PROJECT_CLIENT_LINKED":
    case "PROJECT_STEP_UPDATED":
    case "PROJECT_MESSAGE_ADDED":
      return en ? "Project" : "Projekt";
    case "CONVERSATION_MESSAGE_ADDED":
      return en ? "Message" : "Mesazh";
    case "ORDER_PLACED":
    case "ORDER_STATUS_CHANGED":
      return en ? "Order" : "Porosi";
    case "QUOTE_SUBMITTED":
    case "QUOTE_STATUS_CHANGED":
    case "SHOP_QUOTE_SUBMITTED":
      return en ? "Quote" : "Ofertë";
    case "CLIENT_INVITED":
    case "CLIENT_ACCOUNT_UPDATED":
      return en ? "Account" : "Llogari";
    case "COMPANY_MEMBER_ADDED":
      return en ? "Company" : "Kompani";
    case "STAFF_ACL_CHANGED":
    case "STAFF_REMOVED":
      return en ? "Staff" : "Staf";
    case "CONTACT_FORM_SUBMITTED":
      return en ? "Contact" : "Kontakt";
    case "USER_REGISTERED":
    case "PASSWORD_CHANGED":
      return en ? "Security" : "Siguri";
    default:
      return en ? "Notification" : "Njoftim";
  }
}
