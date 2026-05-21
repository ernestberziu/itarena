import { db } from "@/lib/db";
import { CLIENT_VISIBLE_STATUS_NEW_VALUES } from "@/lib/ticket-activity";
import type { EmitNotificationInput } from "@/lib/notifications/types";
import {
  listAdminIds,
  listStaffIdsWithAcl,
  listTicketStaffRecipientIds,
} from "@/lib/notifications/recipients/staff-acl";
import {
  listConversationParticipantIds,
  listPortalOrderViewerIds,
  listPortalQuoteViewerIds,
  listPortalTicketViewerIds,
  listProjectMemberStaffIds,
  listProjectPortalRecipientIds,
} from "@/lib/notifications/recipients/portal";
import { STAFF_ROLES } from "@/types/domain";

function excludeActor(ids: string[], actorId?: string | null, enabled = true): string[] {
  if (!enabled || !actorId) return ids;
  return ids.filter((id) => id !== actorId);
}

function unique(ids: string[]): string[] {
  return [...new Set(ids)];
}

async function loadTicket(ticketId: string) {
  return db.ticket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      number: true,
      title: true,
      status: true,
      createdById: true,
      assignedToId: true,
      companyId: true,
    },
  });
}

export async function resolveTicketCreatedRecipients(
  input: EmitNotificationInput
): Promise<string[]> {
  const ticketId = input.entity?.id ?? String(input.payload?.ticketId ?? "");
  const ticket = await loadTicket(ticketId);
  if (!ticket) return [];
  const staff = await listTicketStaffRecipientIds(ticket);
  const portal = await listPortalTicketViewerIds(ticket);
  return unique(
    excludeActor([...staff, ...portal], input.actorId, input.excludeActor !== false)
  );
}

export async function resolveTicketAssignedRecipients(
  input: EmitNotificationInput
): Promise<string[]> {
  const ticketId = input.entity?.id ?? String(input.payload?.ticketId ?? "");
  const ticket = await loadTicket(ticketId);
  if (!ticket) return [];
  const ids: string[] = [];
  if (ticket.assignedToId) ids.push(ticket.assignedToId);
  const prev = String(input.payload?.previousAssigneeId ?? "");
  if (prev) ids.push(prev);
  const portal = await listPortalTicketViewerIds(ticket);
  return unique(
    excludeActor([...ids, ...portal], input.actorId, input.excludeActor !== false)
  );
}

export async function resolveTicketStatusRecipients(
  input: EmitNotificationInput
): Promise<string[]> {
  const ticketId = input.entity?.id ?? String(input.payload?.ticketId ?? "");
  const newStatus = String(input.payload?.newStatus ?? "");
  const ticket = await loadTicket(ticketId);
  if (!ticket) return [];
  const staff = await listTicketStaffRecipientIds(ticket);
  let portal = await listPortalTicketViewerIds(ticket);
  if (newStatus && !CLIENT_VISIBLE_STATUS_NEW_VALUES.includes(newStatus as never)) {
    portal = [];
  }
  return unique(
    excludeActor([...staff, ...portal], input.actorId, input.excludeActor !== false)
  );
}

export async function resolveTicketCommentRecipients(
  input: EmitNotificationInput
): Promise<string[]> {
  const ticketId = input.entity?.id ?? String(input.payload?.ticketId ?? "");
  const isInternal = Boolean(input.payload?.isInternal);
  const ticket = await loadTicket(ticketId);
  if (!ticket) return [];
  if (isInternal) {
    return unique(
      excludeActor(
        await listTicketStaffRecipientIds(ticket),
        input.actorId,
        input.excludeActor !== false
      )
    );
  }
  const staff = await listTicketStaffRecipientIds(ticket);
  const portal = await listPortalTicketViewerIds(ticket);
  return unique(
    excludeActor([...staff, ...portal], input.actorId, input.excludeActor !== false)
  );
}

export async function resolveProjectRecipients(
  input: EmitNotificationInput
): Promise<string[]> {
  const projectId = input.entity?.id ?? String(input.payload?.projectId ?? "");
  const staff = await listProjectMemberStaffIds(projectId);
  const portal = await listProjectPortalRecipientIds(projectId);
  return unique(
    excludeActor([...staff, ...portal], input.actorId, input.excludeActor !== false)
  );
}

export async function resolveProjectStepRecipients(
  input: EmitNotificationInput
): Promise<string[]> {
  const projectId = input.entity?.id ?? String(input.payload?.projectId ?? "");
  if (!input.payload?.clientVisible) return [];
  return unique(
    excludeActor(
      await listProjectPortalRecipientIds(projectId),
      input.actorId,
      input.excludeActor !== false
    )
  );
}

export async function resolveProjectMessageRecipients(
  input: EmitNotificationInput
): Promise<string[]> {
  const projectId = input.entity?.id ?? String(input.payload?.projectId ?? "");
  const staff = await listProjectMemberStaffIds(projectId);
  if (Boolean(input.payload?.isInternal)) {
    return unique(
      excludeActor(staff, input.actorId, input.excludeActor !== false)
    );
  }
  const portal = await listProjectPortalRecipientIds(projectId);
  return unique(
    excludeActor([...staff, ...portal], input.actorId, input.excludeActor !== false)
  );
}

export async function resolveConversationMessageRecipients(
  input: EmitNotificationInput
): Promise<string[]> {
  const conversationId = String(input.payload?.conversationId ?? input.entity?.id ?? "");
  if (!conversationId) return [];
  if (input.payload?.isInternal) {
    const parts = await listConversationParticipantIds(conversationId);
    const staffParts: string[] = [];
    for (const uid of parts) {
      const u = await db.user.findUnique({ where: { id: uid }, select: { role: true } });
      if (u && STAFF_ROLES.includes(u.role as (typeof STAFF_ROLES)[number])) {
        staffParts.push(uid);
      }
    }
    return unique(
      excludeActor(staffParts, input.actorId, input.excludeActor !== false)
    );
  }
  const parts = await listConversationParticipantIds(conversationId);
  const portalParts: string[] = [];
  const staffParts: string[] = [];
  for (const uid of parts) {
    const u = await db.user.findUnique({ where: { id: uid }, select: { role: true } });
    if (!u) continue;
    if (STAFF_ROLES.includes(u.role as (typeof STAFF_ROLES)[number])) staffParts.push(uid);
    else portalParts.push(uid);
  }
  return unique(
    excludeActor(
      [...staffParts, ...portalParts],
      input.actorId,
      input.excludeActor !== false
    )
  );
}

export async function resolveOrderRecipients(
  input: EmitNotificationInput,
  kind: "placed" | "status"
): Promise<string[]> {
  const orderId = input.entity?.id ?? String(input.payload?.orderId ?? "");
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { userId: true, companyId: true, orderNumber: true },
  });
  if (!order) return [];
  const portal = await listPortalOrderViewerIds(order);
  const staff = await listStaffIdsWithAcl("orders", "read");
  return unique(
    excludeActor([...portal, ...staff], input.actorId, input.excludeActor !== false)
  );
}

export async function resolveQuoteSubmittedRecipients(
  input: EmitNotificationInput
): Promise<string[]> {
  return unique(
    excludeActor(
      await listStaffIdsWithAcl("quotes", "read"),
      input.actorId,
      input.excludeActor !== false
    )
  );
}

export async function resolveQuoteStatusRecipients(
  input: EmitNotificationInput
): Promise<string[]> {
  const quoteId = input.entity?.id ?? String(input.payload?.quoteId ?? "");
  const quote = await db.quote.findUnique({
    where: { id: quoteId },
    select: { requestedById: true, companyId: true },
  });
  if (!quote) return [];
  const portal = await listPortalQuoteViewerIds(quote);
  const staff = await listStaffIdsWithAcl("quotes", "read");
  return unique(
    excludeActor([...portal, ...staff], input.actorId, input.excludeActor !== false)
  );
}

export async function resolveSingleUser(
  input: EmitNotificationInput,
  userId: string
): Promise<string[]> {
  return unique(
    excludeActor([userId], input.actorId, input.excludeActor !== false)
  );
}

export async function resolveContactRecipients(
  input: EmitNotificationInput
): Promise<string[]> {
  const admins = await listAdminIds();
  const sales = await listStaffIdsWithAcl("quotes", "read");
  return unique(
    excludeActor([...admins, ...sales], input.actorId, input.excludeActor !== false)
  );
}

export async function resolveClientsReadStaff(
  input: EmitNotificationInput
): Promise<string[]> {
  return unique(
    excludeActor(
      await listStaffIdsWithAcl("clients", "read"),
      input.actorId,
      input.excludeActor !== false
    )
  );
}
