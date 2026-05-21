import type { EmitNotificationInput, NotificationEventType } from "@/lib/notifications/types";

function str(payload: EmitNotificationInput["payload"], key: string): string {
  const v = payload?.[key];
  return v != null ? String(v) : "";
}

function ticketLink(payload: EmitNotificationInput["payload"]): string {
  const id = str(payload, "ticketId");
  return id ? `/admin/tickets/${id}` : "/admin/tickets";
}

function portalTicketLink(payload: EmitNotificationInput["payload"]): string {
  const id = str(payload, "ticketId");
  return id ? `/portal/tickets/${id}` : "/portal/tickets";
}

function projectLink(payload: EmitNotificationInput["payload"]): string {
  const id = str(payload, "projectId");
  return id ? `/admin/projects/${id}` : "/admin/projects";
}

function portalProjectLink(payload: EmitNotificationInput["payload"]): string {
  const id = str(payload, "projectId");
  return id ? `/portal/projects/${id}` : "/portal/projects";
}

export type RenderedCopy = {
  title: string;
  titleEn: string;
  body: string;
  bodyEn: string;
  link: string | null;
};

/** Shown to portal clients when a staff member triggers the notification. */
export const CLIENT_FACING_ACTOR_LABEL = "IT Arena";

export type RenderNotificationOptions = {
  /** When true, portal copy uses IT Arena instead of the staff member's name. */
  actorIsStaff?: boolean;
};

function displayAuthorName(
  audience: "staff" | "portal",
  payload: EmitNotificationInput["payload"],
  actorIsStaff: boolean
): string {
  const clientName = str(payload, "clientName");
  const actorName = str(payload, "actorName");

  if (audience === "portal" && actorIsStaff) {
    return CLIENT_FACING_ACTOR_LABEL;
  }
  return actorName || clientName;
}

export function renderNotificationCopy(
  type: NotificationEventType,
  input: EmitNotificationInput,
  audience: "staff" | "portal",
  options: RenderNotificationOptions = {}
): RenderedCopy {
  const p = input.payload ?? {};
  const num = str(p, "ticketNumber") || str(p, "orderNumber") || str(p, "quoteNumber");
  const title = str(p, "title") || str(p, "subject");
  const name = displayAuthorName(audience, p, options.actorIsStaff === true);
  const status = str(p, "status") || str(p, "newStatus");
  const oldStatus = str(p, "oldStatus");
  const stepTitle = str(p, "stepTitle");

  switch (type) {
    case "TICKET_CREATED":
      return {
        title: `Biletë e re: ${num}`,
        titleEn: `New ticket: ${num}`,
        body: title || "Një biletë e re u krijua.",
        bodyEn: title || "A new support ticket was created.",
        link: audience === "portal" ? portalTicketLink(p) : ticketLink(p),
      };
    case "TICKET_ASSIGNED":
      return {
        title: `Biletë e caktuar: ${num}`,
        titleEn: `Ticket assigned: ${num}`,
        body: title,
        bodyEn: title,
        link: audience === "portal" ? portalTicketLink(p) : ticketLink(p),
      };
    case "TICKET_STATUS_CHANGED":
      return {
        title: `Statusi i biletës ${num}`,
        titleEn: `Ticket ${num} status update`,
        body: oldStatus ? `${oldStatus} → ${status}` : status,
        bodyEn: oldStatus ? `${oldStatus} → ${status}` : status,
        link: audience === "portal" ? portalTicketLink(p) : ticketLink(p),
      };
    case "TICKET_COMMENT_ADDED":
      return {
        title: `Koment i ri: ${num}`,
        titleEn: `New comment: ${num}`,
        body: name ? `${name}: ${str(p, "excerpt") || "Koment i ri"}` : str(p, "excerpt") || "Koment i ri",
        bodyEn: name ? `${name}: ${str(p, "excerpt") || "New comment"}` : str(p, "excerpt") || "New comment",
        link: audience === "portal" ? portalTicketLink(p) : ticketLink(p),
      };
    case "TICKET_SLA_BREACHED":
      return {
        title: `SLA e shkelur: ${num}`,
        titleEn: `SLA breached: ${num}`,
        body: title,
        bodyEn: title,
        link: ticketLink(p),
      };
    case "PROJECT_CREATED":
      return {
        title: `Projekt i ri: ${title}`,
        titleEn: `New project: ${title}`,
        body: str(p, "description") || "",
        bodyEn: str(p, "description") || "",
        link: audience === "portal" ? portalProjectLink(p) : projectLink(p),
      };
    case "PROJECT_UPDATED":
      return {
        title: `Projekti u përditësua: ${title}`,
        titleEn: `Project updated: ${title}`,
        body: "",
        bodyEn: "",
        link: audience === "portal" ? portalProjectLink(p) : projectLink(p),
      };
    case "PROJECT_CLIENT_LINKED":
      return {
        title: `Jeni shtuar në projekt: ${title}`,
        titleEn: `Added to project: ${title}`,
        body: "",
        bodyEn: "",
        link: portalProjectLink(p),
      };
    case "PROJECT_STEP_UPDATED":
      return {
        title: `Hapi i projektit: ${stepTitle || title}`,
        titleEn: `Project step: ${stepTitle || title}`,
        body: status,
        bodyEn: status,
        link: portalProjectLink(p),
      };
    case "PROJECT_MESSAGE_ADDED":
      return {
        title: `Mesazh projekti: ${title}`,
        titleEn: `Project message: ${title}`,
        body: str(p, "excerpt") || "",
        bodyEn: str(p, "excerpt") || "",
        link: audience === "portal" ? portalProjectLink(p) : projectLink(p),
      };
    case "CONVERSATION_MESSAGE_ADDED":
      return {
        title: `Mesazh i ri`,
        titleEn: `New message`,
        body: str(p, "excerpt") || name,
        bodyEn: str(p, "excerpt") || name,
        link: str(p, "conversationId")
          ? audience === "portal"
            ? `/portal/messages`
            : `/admin/messages`
          : null,
      };
    case "ORDER_PLACED":
      return {
        title: `Porosi e re: ${num}`,
        titleEn: `New order: ${num}`,
        body: title,
        bodyEn: title,
        link: audience === "portal" ? `/portal/orders` : `/admin/orders`,
      };
    case "ORDER_STATUS_CHANGED":
      return {
        title: `Porosia ${num}`,
        titleEn: `Order ${num}`,
        body: status,
        bodyEn: status,
        link: audience === "portal" ? `/portal/orders` : `/admin/orders`,
      };
    case "QUOTE_SUBMITTED":
    case "SHOP_QUOTE_SUBMITTED":
      return {
        title: `Ofertë e re: ${num || title}`,
        titleEn: `New quote: ${num || title}`,
        body: str(p, "companyName") || "",
        bodyEn: str(p, "companyName") || "",
        link: `/admin/quotes`,
      };
    case "QUOTE_STATUS_CHANGED":
      return {
        title: `Oferta ${num}`,
        titleEn: `Quote ${num}`,
        body: status,
        bodyEn: status,
        link: audience === "portal" ? `/portal/quotes` : `/admin/quotes`,
      };
    case "CLIENT_INVITED":
      return {
        title: "Ftesë në portal",
        titleEn: "Portal invitation",
        body: "Llogaria juaj në portal është gati.",
        bodyEn: "Your portal account is ready.",
        link: "/portal/dashboard",
      };
    case "CLIENT_ACCOUNT_UPDATED":
      return {
        title: "Llogaria u përditësua",
        titleEn: "Account updated",
        body: str(p, "detail") || "",
        bodyEn: str(p, "detail") || "",
        link: "/portal/settings",
      };
    case "COMPANY_MEMBER_ADDED":
      return {
        title: "Shtuar në kompani",
        titleEn: "Added to company",
        body: str(p, "companyName") || "",
        bodyEn: str(p, "companyName") || "",
        link: "/portal/company",
      };
    case "STAFF_ACL_CHANGED":
      return {
        title: "Të drejtat u përditësuan",
        titleEn: "Permissions updated",
        body: "",
        bodyEn: "",
        link: "/admin/profile",
      };
    case "STAFF_REMOVED":
      return {
        title: "Stafi u hoq",
        titleEn: "Staff member removed",
        body: name,
        bodyEn: name,
        link: "/admin/staff",
      };
    case "PUBLIC_SHARE_GUEST_COMMENT":
      return {
        title: `Koment nga klienti: ${num || title}`,
        titleEn: `Guest comment: ${num || title}`,
        body: `${name}: ${str(p, "excerpt") || ""}`,
        bodyEn: `${name}: ${str(p, "excerpt") || ""}`,
        link: ticketLink(p) || projectLink(p),
      };
    case "CONTACT_FORM_SUBMITTED":
      return {
        title: "Mesazh kontakti",
        titleEn: "Contact form message",
        body: str(p, "excerpt") || "",
        bodyEn: str(p, "excerpt") || "",
        link: "/admin/settings",
      };
    case "USER_REGISTERED":
      return {
        title: "Regjistrim i ri",
        titleEn: "New registration",
        body: name || str(p, "email"),
        bodyEn: name || str(p, "email"),
        link: "/admin/clients",
      };
    case "PASSWORD_CHANGED":
      return {
        title: "Fjalëkalimi u ndryshua",
        titleEn: "Password changed",
        body: "",
        bodyEn: "",
        link: audience === "portal" ? "/portal/settings" : "/admin/profile",
      };
    default:
      return {
        title: "Njoftim",
        titleEn: "Notification",
        body: "",
        bodyEn: "",
        link: input.link ?? null,
      };
  }
}
