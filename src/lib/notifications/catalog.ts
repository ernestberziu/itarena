import type { CatalogEntry, EmitNotificationInput, NotificationEventType } from "@/lib/notifications/types";
import {
  resolveClientsReadStaff,
  resolveContactRecipients,
  resolveConversationMessageRecipients,
  resolveOrderRecipients,
  resolveProjectMessageRecipients,
  resolveProjectRecipients,
  resolveProjectStepRecipients,
  resolveQuoteStatusRecipients,
  resolveQuoteSubmittedRecipients,
  resolveSingleUser,
  resolveTicketAssignedRecipients,
  resolveTicketCommentRecipients,
  resolveTicketCreatedRecipients,
  resolveTicketStatusRecipients,
} from "@/lib/notifications/recipients/index";

const CATALOG: Record<NotificationEventType, CatalogEntry> = {
  TICKET_CREATED: {
    category: "TICKET",
    severity: "action",
    aclFeature: "tickets",
    resolveRecipients: resolveTicketCreatedRecipients,
  },
  TICKET_ASSIGNED: {
    category: "TICKET",
    severity: "action",
    resolveRecipients: resolveTicketAssignedRecipients,
  },
  TICKET_STATUS_CHANGED: {
    category: "TICKET",
    severity: "info",
    resolveRecipients: resolveTicketStatusRecipients,
  },
  TICKET_COMMENT_ADDED: {
    category: "TICKET",
    severity: "action",
    resolveRecipients: resolveTicketCommentRecipients,
  },
  TICKET_SLA_BREACHED: {
    category: "TICKET",
    severity: "urgent",
    resolveRecipients: resolveTicketCreatedRecipients,
  },
  PROJECT_CREATED: {
    category: "PROJECT",
    severity: "action",
    resolveRecipients: resolveProjectRecipients,
  },
  PROJECT_UPDATED: {
    category: "PROJECT",
    severity: "info",
    resolveRecipients: resolveProjectRecipients,
  },
  PROJECT_CLIENT_LINKED: {
    category: "PROJECT",
    severity: "action",
    resolveRecipients: async (input) => {
      const userId = String(input.payload?.userId ?? "");
      return userId ? resolveSingleUser(input, userId) : [];
    },
  },
  PROJECT_STEP_UPDATED: {
    category: "PROJECT",
    severity: "info",
    resolveRecipients: resolveProjectStepRecipients,
  },
  PROJECT_MESSAGE_ADDED: {
    category: "PROJECT",
    severity: "action",
    resolveRecipients: resolveProjectMessageRecipients,
  },
  CONVERSATION_MESSAGE_ADDED: {
    category: "MESSAGE",
    severity: "action",
    resolveRecipients: resolveConversationMessageRecipients,
  },
  ORDER_PLACED: {
    category: "ORDER",
    severity: "action",
    resolveRecipients: (input) => resolveOrderRecipients(input, "placed"),
  },
  ORDER_STATUS_CHANGED: {
    category: "ORDER",
    severity: "info",
    resolveRecipients: (input) => resolveOrderRecipients(input, "status"),
  },
  QUOTE_SUBMITTED: {
    category: "QUOTE",
    severity: "action",
    resolveRecipients: resolveQuoteSubmittedRecipients,
  },
  QUOTE_STATUS_CHANGED: {
    category: "QUOTE",
    severity: "info",
    resolveRecipients: resolveQuoteStatusRecipients,
  },
  SHOP_QUOTE_SUBMITTED: {
    category: "SHOP",
    severity: "action",
    resolveRecipients: resolveQuoteSubmittedRecipients,
  },
  CLIENT_INVITED: {
    category: "CLIENT",
    severity: "action",
    excludeActor: false,
    resolveRecipients: async (input) => {
      const userId = String(input.payload?.userId ?? "");
      return userId ? resolveSingleUser(input, userId) : [];
    },
  },
  CLIENT_ACCOUNT_UPDATED: {
    category: "CLIENT",
    severity: "info",
    resolveRecipients: async (input) => {
      const userId = String(input.payload?.userId ?? "");
      return userId ? resolveSingleUser(input, userId) : [];
    },
  },
  COMPANY_MEMBER_ADDED: {
    category: "COMPANY",
    severity: "action",
    resolveRecipients: async (input) => {
      const userId = String(input.payload?.userId ?? "");
      return userId ? resolveSingleUser(input, userId) : [];
    },
  },
  STAFF_ACL_CHANGED: {
    category: "STAFF",
    severity: "info",
    resolveRecipients: async (input) => {
      const userId = String(input.payload?.userId ?? "");
      return userId ? resolveSingleUser(input, userId) : [];
    },
  },
  STAFF_REMOVED: {
    category: "STAFF",
    severity: "info",
    resolveRecipients: resolveClientsReadStaff,
  },
  PUBLIC_SHARE_GUEST_COMMENT: {
    category: "TICKET",
    severity: "action",
    resolveRecipients: async (input) => {
      const ticketId = input.payload?.ticketId as string | undefined;
      const projectId = input.payload?.projectId as string | undefined;
      if (ticketId) {
        return resolveTicketCommentRecipients({
          ...input,
          entity: { type: "ticket", id: ticketId },
          payload: { ...input.payload, isInternal: false },
        });
      }
      if (projectId) {
        return resolveProjectMessageRecipients({
          ...input,
          entity: { type: "project", id: projectId },
        });
      }
      return [];
    },
  },
  CONTACT_FORM_SUBMITTED: {
    category: "SYSTEM",
    severity: "action",
    resolveRecipients: resolveContactRecipients,
  },
  USER_REGISTERED: {
    category: "SECURITY",
    severity: "info",
    resolveRecipients: resolveClientsReadStaff,
  },
  PASSWORD_CHANGED: {
    category: "SECURITY",
    severity: "info",
    excludeActor: false,
    resolveRecipients: async (input) => {
      const userId = String(input.payload?.userId ?? input.actorId ?? "");
      return userId ? resolveSingleUser(input, userId) : [];
    },
  },
};

export function getCatalogEntry(type: NotificationEventType): CatalogEntry {
  return CATALOG[type];
}
