import "server-only";
import { absoluteUrl } from "@/lib/email/brand";
import { pickLocale } from "@/lib/email/brand";
import { renderEmail } from "@/lib/email/render";
import type { RenderedCopy } from "@/lib/notifications/templates";
import type { NotificationEventType } from "@/lib/notifications/types";
import { NotificationEmail } from "@/emails/templates/notification-email";

export type BuildNotificationEmailInput = {
  type: NotificationEventType;
  copy: RenderedCopy;
  locale: "sq" | "en";
  recipientName?: string | null;
  link?: string | null;
};

export async function buildNotificationEmail(
  input: BuildNotificationEmailInput,
): Promise<{ subject: string; html: string; text: string }> {
  const locale = pickLocale(input.locale);
  const title = locale === "en" && input.copy.titleEn ? input.copy.titleEn : input.copy.title;
  const body = locale === "en" && input.copy.bodyEn ? input.copy.bodyEn : input.copy.body;
  const linkPath = input.link ?? input.copy.link;
  const absoluteLink = linkPath ? absoluteUrl(linkPath) : null;

  const element = NotificationEmail({
    locale,
    type: input.type,
    title,
    body,
    absoluteLink,
    recipientName: input.recipientName,
  });

  const { html, text } = await renderEmail(element);
  return { subject: title, html, text };
}
