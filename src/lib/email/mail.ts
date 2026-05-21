import "server-only";
import { isSmtpConfigured } from "@/lib/email/transport";
import { deliverHtmlEmail } from "@/lib/email/send-transactional";
import { escapeHtml } from "@/lib/email/brand";

export { isSmtpConfigured as emailConfigured } from "@/lib/email/transport";
export { deliverHtmlEmail, sendHtmlEmail } from "@/lib/email/send-transactional";
export { fromAddress, smtpFromAddress, smtpFromName } from "@/lib/email/transport";

export type MailMessage = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
};

function normalizeBodies(msg: MailMessage): { text: string; html: string } {
  let text = msg.text?.trim() ?? "";
  let html = msg.html?.trim() ?? "";

  if (!html && text) {
    html = `<div style="font-family:system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.55;color:#0f172a;white-space:pre-wrap;">${escapeHtml(text)}</div>`;
  }
  if (!text && html) {
    text = html
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) text = "(See HTML version)";
  }

  return { text, html };
}

export async function sendMail(
  msg: MailMessage,
): Promise<{ ok: boolean; reason?: string }> {
  const { text, html } = normalizeBodies(msg);
  if (!text && !html) {
    return { ok: false, reason: "Empty body" };
  }
  const htmlBody = html || `<p>${escapeHtml(text)}</p>`;
  return deliverHtmlEmail({
    to: msg.to,
    subject: msg.subject,
    html: htmlBody,
    text,
    replyTo: msg.replyTo,
  });
}
