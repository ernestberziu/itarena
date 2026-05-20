import { formatPrice } from "@/lib/utils";
import { orderStatusLabel } from "@/lib/admin-order-status";
import {
  getFulfilledQty,
  parseFulfillmentItems,
  type OrderLineItem,
} from "@/lib/order-fulfillment";

export type OrderAuditLogEntry = {
  id: string;
  action: string;
  metadata: string | null;
  createdAt: string;
  actor: { firstName: string; lastName: string } | null;
};

export type OrderActivityItem = {
  id: string;
  at: string;
  tone: "default" | "success" | "accent";
  title: string;
  details: string[];
  actorName?: string;
  pending?: boolean;
};

type OrderAuditChange =
  | { type: "status"; from: string; to: string }
  | { type: "staffNotes"; from: string | null; to: string | null }
  | {
      type: "fulfillment";
      lines: { label: string; sku?: string; from: number; to: number; ordered: number }[];
    }
  | { type: "total"; from: number; to: number };

function t(locale: string, sq: string, en: string): string {
  return locale === "en" ? en : sq;
}

function actorLabel(actor: OrderAuditLogEntry["actor"], locale: string): string | undefined {
  if (!actor) return locale === "en" ? "System" : "Sistemi";
  return `${actor.firstName} ${actor.lastName}`.trim();
}

function formatChange(change: OrderAuditChange, locale: string): string[] {
  switch (change.type) {
    case "status":
      if (change.from === change.to) {
        return [orderStatusLabel(change.to, locale)];
      }
      return [
        `${orderStatusLabel(change.from, locale)} → ${orderStatusLabel(change.to, locale)}`,
      ];
    case "staffNotes":
      if (!change.from && change.to) {
        return [t(locale, "Shënim i brendshëm u shtua", "Internal note added")];
      }
      if (change.from && !change.to) {
        return [t(locale, "Shënimi i brendshëm u hoq", "Internal note cleared")];
      }
      return [t(locale, "Shënimi i brendshëm u përditësua", "Internal note updated")];
    case "fulfillment":
      return change.lines.map((line) => {
        const name = line.label;
        if (line.to <= 0) {
          return t(locale, `${name}: mungon (porositur ${line.ordered})`, `${name}: unavailable (ordered ${line.ordered})`);
        }
        if (line.to < line.ordered) {
          return t(
            locale,
            `${name}: ${line.from} → ${line.to} (porositur ${line.ordered})`,
            `${name}: ${line.from} → ${line.to} (ordered ${line.ordered})`
          );
        }
        return t(
          locale,
          `${name}: ${line.from} → ${line.to}`,
          `${name}: ${line.from} → ${line.to}`
        );
      });
    case "total":
      return [
        t(
          locale,
          `${formatPrice(change.from)} → ${formatPrice(change.to)}`,
          `${formatPrice(change.from)} → ${formatPrice(change.to)}`
        ),
      ];
    default:
      return [];
  }
}

function parseAuditChanges(metadata: string | null): OrderAuditChange[] {
  if (!metadata) return [];
  try {
    const parsed = JSON.parse(metadata) as {
      changes?: OrderAuditChange[];
      status?: string;
      staffNotes?: boolean;
      fulfillment?: unknown;
    };
    if (Array.isArray(parsed.changes) && parsed.changes.length > 0) {
      return parsed.changes;
    }
    const legacy: OrderAuditChange[] = [];
    if (parsed.status) {
      legacy.push({
        type: "status",
        from: parsed.status,
        to: parsed.status,
      });
    }
    if (parsed.staffNotes) {
      legacy.push({ type: "staffNotes", from: null, to: "…" });
    }
    return legacy;
  } catch {
    return [];
  }
}

export function buildOrderActivityTimeline(
  logs: OrderAuditLogEntry[],
  createdAt: string,
  locale: string
): OrderActivityItem[] {
  const items: OrderActivityItem[] = [
    {
      id: "created",
      at: createdAt,
      tone: "default",
      title: t(locale, "Porosia u vendos", "Order placed"),
      details: [],
    },
  ];

  for (const log of logs) {
    if (log.action === "CREATE") continue;

    const changes = parseAuditChanges(log.metadata);
    if (changes.length === 0) continue;

    for (const change of changes) {
      const details = formatChange(change, locale);
      if (details.length === 0) continue;

      let title = t(locale, "Porosia u përditësua", "Order updated");
      let tone: OrderActivityItem["tone"] = "default";

      if (change.type === "status") {
        title = t(locale, "Statusi u ndryshua", "Status changed");
        if (change.to === "DELIVERED") tone = "success";
        if (change.to === "CANCELLED") tone = "accent";
      } else if (change.type === "fulfillment") {
        title = t(locale, "Disponueshmëria u përditësua", "Availability updated");
        tone = "accent";
      } else if (change.type === "staffNotes") {
        title = t(locale, "Shënimi i brendshëm", "Internal note");
      } else if (change.type === "total") {
        title = t(locale, "Totali u përditësua", "Total updated");
      }

      items.push({
        id: `${log.id}-${change.type}-${title}`,
        at: log.createdAt,
        tone,
        title,
        details,
        actorName: actorLabel(log.actor, locale),
      });
    }
  }

  items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  return items;
}

export function buildPendingOrderChanges(
  saved: {
    status: string;
    staffNotes: string | null;
    itemsJson: string;
    total: string;
  },
  draft: {
    status: string;
    staffNotes: string;
    items: OrderLineItem[];
  },
  locale: string
): OrderActivityItem[] {
  const pending: OrderActivityItem[] = [];
  const now = new Date().toISOString();

  if (draft.status !== saved.status) {
    pending.push({
      id: "pending-status",
      at: now,
      tone: draft.status === "CANCELLED" ? "accent" : "default",
      title: t(locale, "Statusi (pa ruajtur)", "Status (unsaved)"),
      details: [
        `${orderStatusLabel(saved.status, locale)} → ${orderStatusLabel(draft.status, locale)}`,
      ],
      pending: true,
    });
  }

  const savedItems = parseFulfillmentItems(saved.itemsJson);
  const lineChanges = savedItems
    .map((row, index) => {
      const draftItem = draft.items[index];
      if (!draftItem) return null;
      const from = getFulfilledQty(row);
      const to = getFulfilledQty(draftItem);
      if (from === to) return null;
      return { label: row.name, sku: row.sku, from, to, ordered: row.quantity };
    })
    .filter((line): line is NonNullable<typeof line> => line != null);

  if (lineChanges.length > 0) {
    pending.push({
      id: "pending-fulfillment",
      at: now,
      tone: "accent",
      title: t(locale, "Disponueshmëria (pa ruajtur)", "Availability (unsaved)"),
      details: formatChange({ type: "fulfillment", lines: lineChanges }, locale),
      pending: true,
    });
  }

  const savedNotes = saved.staffNotes ?? "";
  if (draft.staffNotes !== savedNotes) {
    pending.push({
      id: "pending-notes",
      at: now,
      tone: "default",
      title: t(locale, "Shënimi i brendshëm (pa ruajtur)", "Internal note (unsaved)"),
      details: [t(locale, "Ndryshim i paruajtur", "Unsaved change")],
      pending: true,
    });
  }

  return pending;
}

export function buildOrderAuditChanges(
  order: {
    status: string;
    staffNotes: string | null;
    items: string;
    total: unknown;
  },
  parsed: {
    status?: string;
    staffNotes?: string;
    items?: OrderLineItem[];
  },
  mergedItems?: OrderLineItem[],
  fulfilledTotal?: number
): OrderAuditChange[] {
  const changes: OrderAuditChange[] = [];

  if (parsed.status !== undefined && parsed.status !== order.status) {
    changes.push({ type: "status", from: order.status, to: parsed.status });
  }

  if (parsed.staffNotes !== undefined && parsed.staffNotes !== (order.staffNotes ?? "")) {
    changes.push({
      type: "staffNotes",
      from: order.staffNotes,
      to: parsed.staffNotes,
    });
  }

  if (mergedItems && parsed.items) {
    const existing = parseFulfillmentItems(order.items);
    const lines = existing
      .map((row, index) => {
        const next = mergedItems[index];
        const from = getFulfilledQty(row);
        const to = getFulfilledQty(next);
        if (from === to) return null;
        return {
          label: row.name,
          sku: row.sku,
          from,
          to,
          ordered: row.quantity,
        };
      })
      .filter((line): line is NonNullable<typeof line> => line != null);

    if (lines.length > 0) {
      changes.push({ type: "fulfillment", lines });
    }

    if (fulfilledTotal !== undefined) {
      const fromTotal = Number(order.total);
      if (!Number.isNaN(fromTotal) && fromTotal !== fulfilledTotal) {
        changes.push({ type: "total", from: fromTotal, to: fulfilledTotal });
      }
    }
  }

  return changes;
}
