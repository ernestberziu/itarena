import "server-only";
import type { ReactElement } from "react";
import { renderEmail } from "@/lib/email/render";
import { sendHtmlEmail } from "@/lib/email/send-transactional";
import { isSmtpConfigured } from "@/lib/email/transport";
import { pickLocale, type EmailLocale } from "@/lib/email/brand";

export type SendResult = { sent: true } | { sent: false };

export async function sendRenderedEmail(opts: {
  to: string;
  subject: string;
  element: ReactElement;
}): Promise<SendResult> {
  if (!isSmtpConfigured()) {
    return { sent: false };
  }
  const { html, text } = await renderEmail(opts.element);
  const ok = await sendHtmlEmail({
    to: opts.to,
    subject: opts.subject,
    html,
    text,
  });
  return ok ? { sent: true } : { sent: false };
}

export function resolveMailLocale(language: string | null | undefined, fallback?: EmailLocale): EmailLocale {
  if (language === "en" || language === "sq") return language;
  return fallback ?? "sq";
}

export { pickLocale };
