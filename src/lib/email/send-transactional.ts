import { fromAddress, mailTransport, smtpAuthMailboxAddress } from "@/lib/email/transport";

export type DeliverHtmlResult = {
  ok: boolean;
  reason?: string;
};

export async function deliverHtmlEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<DeliverHtmlResult> {
  const to = opts.to?.trim();
  if (!to) return { ok: false, reason: "Missing recipient" };

  const transporter = mailTransport();
  if (!transporter) {
    return { ok: false, reason: "No email transport configured" };
  }

  const from = fromAddress();
  const mailFrom = smtpAuthMailboxAddress();

  try {
    const info = await transporter.sendMail({
      from: { name: from.name, address: from.address },
      to,
      replyTo: opts.replyTo,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      ...(mailFrom ? { envelope: { from: mailFrom, to } } : {}),
    });
    console.info("[email] SMTP accepted", {
      messageId: info.messageId,
      to,
    });
    return { ok: true };
  } catch (e) {
    const reason = e instanceof Error ? e.message : "send failed";
    console.error("[email] SMTP failed", to, e);
    return { ok: false, reason };
  }
}

export async function sendHtmlEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<boolean> {
  const r = await deliverHtmlEmail(opts);
  return r.ok;
}
