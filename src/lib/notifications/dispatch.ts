import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { emailConfigured } from "@/lib/email/mail";
import { buildNotificationEmail } from "@/lib/email/notification-email";
import { sendMail } from "@/lib/email/mail";
import { pickLocale } from "@/lib/email/brand";
import { getOpsNotifyEmail } from "@/lib/email/ops-notify-email";
import { opsNotifyDedupeKey, shouldSendOpsNotifyEmail } from "@/lib/email/ops-notify-dedupe";
import { shouldUseOpsNotifyInbox } from "@/lib/email/notification-email-routing";
import { getCatalogEntry } from "@/lib/notifications/catalog";
import { renderNotificationCopy } from "@/lib/notifications/templates";
import type { EmitNotificationInput, NotificationEventType } from "@/lib/notifications/types";
import { STAFF_ROLES } from "@/types/domain";

async function isStaffUser(userId: string): Promise<boolean> {
  const u = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  return u != null && STAFF_ROLES.includes(u.role as (typeof STAFF_ROLES)[number]);
}

/**
 * Central notification dispatcher. Resolves authorized recipients, renders copy, persists rows.
 */
export async function emitNotification(input: EmitNotificationInput): Promise<number> {
  if (input.recipientIds?.length) {
    return persistForRecipients(input, input.recipientIds);
  }

  const entry = getCatalogEntry(input.type);
  const recipientIds = await entry.resolveRecipients({
    ...input,
    excludeActor: input.excludeActor ?? entry.excludeActor ?? true,
  });

  if (recipientIds.length === 0) return 0;
  return persistForRecipients(input, recipientIds);
}

async function persistForRecipients(
  input: EmitNotificationInput,
  recipientIds: string[]
): Promise<number> {
  const entry = getCatalogEntry(input.type);
  const entityType = input.entity?.type ?? null;
  const entityId = input.entity?.id ?? null;
  const metadata = (input.payload ?? null) as Prisma.InputJsonValue;

  const actorIsStaff = input.actorId ? await isStaffUser(input.actorId) : false;

  let created = 0;

  for (const userId of recipientIds) {
    const staff = await isStaffUser(userId);
    const copy = renderNotificationCopy(input.type, input, staff ? "staff" : "portal", {
      actorIsStaff,
    });
    const link = input.link ?? copy.link;
    const dedupeKey = input.dedupeKey ? `${userId}:${input.dedupeKey}` : null;

    const data = {
      userId,
      type: input.type,
      category: entry.category,
      severity: entry.severity,
      title: copy.title,
      titleEn: copy.titleEn,
      body: copy.body,
      bodyEn: copy.bodyEn,
      link,
      entityType,
      entityId,
      actorId: input.actorId ?? null,
      metadata,
      dedupeKey,
    };

    if (dedupeKey) {
      try {
        await db.notification.upsert({
          where: {
            userId_dedupeKey: { userId, dedupeKey },
          },
          create: data,
          update: {
            title: data.title,
            titleEn: data.titleEn,
            body: data.body,
            bodyEn: data.bodyEn,
            link: data.link,
            readAt: null,
            createdAt: new Date(),
          },
        });
        created += 1;
      } catch {
        // skip on conflict
      }
    } else {
      await db.notification.create({ data });
      created += 1;
    }

    if (!input.skipEmail && emailConfigured()) {
      queueNotificationEmail({
        userId,
        type: input.type,
        copy,
        link,
        entityType,
        entityId,
        inputDedupeKey: input.dedupeKey ?? null,
      });
    }
  }

  return created;
}

function queueNotificationEmail(opts: {
  userId: string;
  type: NotificationEventType;
  copy: ReturnType<typeof renderNotificationCopy>;
  link: string | null;
  entityType: string | null;
  entityId: string | null;
  inputDedupeKey: string | null;
}): void {
  void sendNotificationEmailForUser(opts).catch((err) => {
    console.error("[notifications] email", opts.type, opts.userId, err);
  });
}

async function sendNotificationEmailForUser(opts: {
  userId: string;
  type: NotificationEventType;
  copy: ReturnType<typeof renderNotificationCopy>;
  link: string | null;
  entityType: string | null;
  entityId: string | null;
  inputDedupeKey: string | null;
}): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: opts.userId },
    select: { email: true, firstName: true, lastName: true, language: true, role: true },
  });
  if (!user?.email?.trim()) return;

  const locale = pickLocale(user.language);
  const useOpsInbox = shouldUseOpsNotifyInbox(user.role, opts.type);

  let emailTo = user.email.trim();
  let recipientName: string | null = `${user.firstName} ${user.lastName}`.trim() || user.firstName;

  if (useOpsInbox) {
    const opsEmail = getOpsNotifyEmail();
    if (!opsEmail) return;

    const dedupeKey = opsNotifyDedupeKey({
      type: opts.type,
      title: opts.copy.title,
      titleEn: opts.copy.titleEn,
      body: opts.copy.body,
      bodyEn: opts.copy.bodyEn,
      link: opts.link,
      entityType: opts.entityType,
      entityId: opts.entityId,
      dedupeKey: opts.inputDedupeKey,
    });
    if (!shouldSendOpsNotifyEmail(dedupeKey)) return;

    emailTo = opsEmail;
    recipientName = null;
  }

  const { subject, html, text } = await buildNotificationEmail({
    type: opts.type,
    copy: opts.copy,
    locale,
    recipientName,
    link: opts.link,
  });

  await sendMail({
    to: emailTo,
    subject,
    html,
    text,
  });
}

/** Fire-and-forget wrapper for API routes (errors logged, never thrown). */
export function emitNotificationSafe(input: EmitNotificationInput): void {
  void emitNotification(input).catch((err) => {
    console.error("[notifications]", input.type, err);
  });
}

export type { EmitNotificationInput, NotificationEventType };
