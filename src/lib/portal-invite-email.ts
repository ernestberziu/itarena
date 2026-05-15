import { Resend } from "resend";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";

export async function sendPortalAccountInviteEmail(params: {
  to: string;
  firstName: string;
  tempPassword: string;
  locale: "sq" | "en";
  ticketNumber?: string;
}): Promise<{ sent: true } | { sent: false }> {
  const key = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();
  if (!key || !fromEmail) {
    return { sent: false };
  }

  const fromName = process.env.RESEND_FROM_NAME?.trim() || "IT Arena";
  const loginUrl = `${APP_URL.replace(/\/$/, "")}/hyr`;

  const subject =
    params.locale === "sq"
      ? "Llogaria juaj në IT Arena"
      : "Your IT Arena portal account";

  const ticketLine =
    params.ticketNumber &&
    (params.locale === "sq"
      ? `<p>Është hapur një bilete për ju: <strong>${params.ticketNumber}</strong>.</p>`
      : `<p>A ticket was opened for you: <strong>${params.ticketNumber}</strong>.</p>`);

  const bodySq = `
    <p>Përshëndetje ${escapeHtml(params.firstName)},</p>
    <p>Ju është krijuar një llogari në portalin IT Arena.</p>
    ${ticketLine ?? ""}
    <p><strong>Email:</strong> ${escapeHtml(params.to)}<br/>
    <strong>Fjalëkalimi i përkohshëm:</strong> <code style="font-size:15px">${escapeHtml(params.tempPassword)}</code></p>
    <p>Ju lutemi hyni dhe ndryshoni fjalëkalimin sa më shpejt të jetë e mundur.</p>
    <p><a href="${loginUrl}">Hyr në portal</a></p>
  `;

  const bodyEn = `
    <p>Hello ${escapeHtml(params.firstName)},</p>
    <p>An IT Arena portal account was created for you.</p>
    ${ticketLine ?? ""}
    <p><strong>Email:</strong> ${escapeHtml(params.to)}<br/>
    <strong>Temporary password:</strong> <code style="font-size:15px">${escapeHtml(params.tempPassword)}</code></p>
    <p>Please sign in and change your password as soon as you can.</p>
    <p><a href="${loginUrl}">Sign in to the portal</a></p>
  `;

  const html = params.locale === "sq" ? bodySq : bodyEn;

  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: params.to,
      subject,
      html,
    });
    if (error) {
      console.error("[portal-invite-email] Resend error:", error);
      return { sent: false };
    }
    return { sent: true };
  } catch (e) {
    console.error("[portal-invite-email] send failed:", e);
    return { sent: false };
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
