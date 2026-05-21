/**
 * Smoke tests for notification catalog, templates, and recipient helpers.
 * Run: `npm run test:notifications`
 */
import { NOTIFICATION_EVENT_TYPES, NOTIFICATION_CATEGORIES } from "../src/lib/notifications/types";
import { getCatalogEntry } from "../src/lib/notifications/catalog";
import {
  CLIENT_FACING_ACTOR_LABEL,
  renderNotificationCopy,
} from "../src/lib/notifications/templates";
import { CLIENT_VISIBLE_STATUS_NEW_VALUES } from "../src/lib/ticket-activity";

function assert(cond: boolean, message: string): void {
  if (!cond) throw new Error(message);
}

for (const type of NOTIFICATION_EVENT_TYPES) {
  const entry = getCatalogEntry(type);
  assert(
    NOTIFICATION_CATEGORIES.includes(entry.category),
    `${type} has valid category ${entry.category}`
  );
  const staff = renderNotificationCopy(type, { type, payload: { ticketNumber: "T-1", title: "Test" } }, "staff");
  const portal = renderNotificationCopy(type, { type, payload: { ticketNumber: "T-1", title: "Test" } }, "portal");
  assert(staff.title.length > 0, `${type} staff title`);
  assert(portal.title.length > 0, `${type} portal title`);
}

assert(
  CLIENT_VISIBLE_STATUS_NEW_VALUES.includes("IN_PROGRESS"),
  "IN_PROGRESS is client-visible for status notifications"
);
assert(
  !CLIENT_VISIBLE_STATUS_NEW_VALUES.includes("ASSIGNED" as never),
  "ASSIGNED is not client-visible"
);

const statusCopy = renderNotificationCopy(
  "TICKET_STATUS_CHANGED",
  {
    type: "TICKET_STATUS_CHANGED",
    payload: { ticketNumber: "T-2", oldStatus: "OPEN", newStatus: "IN_PROGRESS" },
  },
  "portal"
);
assert(statusCopy.body.includes("IN_PROGRESS"), "status copy includes new status");

const internalComment = renderNotificationCopy(
  "TICKET_COMMENT_ADDED",
  {
    type: "TICKET_COMMENT_ADDED",
    payload: { ticketNumber: "T-3", isInternal: true, excerpt: "note" },
  },
  "staff"
);
assert(internalComment.title.length > 0, "internal comment staff copy");

const staffCommentForClient = renderNotificationCopy(
  "TICKET_COMMENT_ADDED",
  {
    type: "TICKET_COMMENT_ADDED",
    payload: {
      ticketNumber: "T-4",
      actorName: "Jane Engineer",
      excerpt: "We are looking into it",
    },
  },
  "portal",
  { actorIsStaff: true }
);
assert(
  staffCommentForClient.body.startsWith(`${CLIENT_FACING_ACTOR_LABEL}:`),
  "portal hides staff name"
);
assert(
  !staffCommentForClient.body.includes("Jane"),
  "portal body must not contain staff name"
);

const clientCommentForClient = renderNotificationCopy(
  "TICKET_COMMENT_ADDED",
  {
    type: "TICKET_COMMENT_ADDED",
    payload: {
      ticketNumber: "T-5",
      actorName: "Klient Test",
      excerpt: "Thanks",
    },
  },
  "portal",
  { actorIsStaff: false }
);
assert(clientCommentForClient.body.startsWith("Klient Test:"), "portal shows client author name");

console.log("test:notifications — catalog, templates, and visibility constants OK");
