import nodemailer from "nodemailer";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";

export async function sendPortalAccountInviteEmail(params: {
  to: string;
  firstName: string;
  tempPassword: string;
  locale: "sq" | "en";
  ticketNumber?: string;
}): Promise<{ sent: true } | { sent: false }> {
  const { subject, html } = buildInviteContent(params);

  if (!isSmtpConfigured()) {
    return { sent: false };
  }

  const sent = await sendViaSmtp(params.to, subject, html);
  return sent ? { sent: true } : { sent: false };
}

function buildInviteContent(params: {
  to: string;
  firstName: string;
  tempPassword: string;
  locale: "sq" | "en";
  ticketNumber?: string;
}) {
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
  return { subject, html };
}

function isSmtpConfigured(): boolean {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = smtpFromAddress();
  return Boolean(host && user && pass && from);
}

function smtpFromAddress(): string | undefined {
  const explicit = process.env.SMTP_FROM_EMAIL?.trim();
  if (explicit) return explicit;
  const user = process.env.SMTP_USER?.trim();
  if (user?.includes("@")) return user;
  return undefined;
}

function smtpFromName(): string {
  return process.env.SMTP_FROM_NAME?.trim() || "IT Arena";
}

async function sendViaSmtp(to: string, subject: string, html: string): Promise<boolean> {
  const host = process.env.SMTP_HOST!.trim();
  const user = process.env.SMTP_USER!.trim();
  const pass = process.env.SMTP_PASS!.trim();
  const portRaw = process.env.SMTP_PORT?.trim();
  const port = portRaw ? Number.parseInt(portRaw, 10) : 587;
  if (Number.isNaN(port) || port < 1) {
    console.error("[portal-invite-email] invalid SMTP_PORT");
    return false;
  }

  const secureEnv = process.env.SMTP_SECURE?.trim().toLowerCase();
  const secure =
    secureEnv === "true" || secureEnv === "1" || port === 465;

  const fromEmail = smtpFromAddress()!;
  const fromName = smtpFromName();

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
    await transporter.sendMail({
      from: { name: fromName, address: fromEmail },
      to,
      subject,
      html,
    });
    return true;
  } catch (e) {
    console.error("[portal-invite-email] SMTP send failed:", e);
    return false;
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Admin updated client email and/or password — email includes temporary password (only in this message). */
export async function sendAdminClientAccountUpdateEmail(params: {
  to: string;
  firstName: string;
  mailLocale: "sq" | "en";
  temporaryPassword: string;
  /** Email the customer must use to sign in after this update. */
  signInEmail: string;
  emailChanged: boolean;
  previousEmail?: string;
}): Promise<{ sent: true } | { sent: false }> {
  if (!isSmtpConfigured()) {
    return { sent: false };
  }

  const loginUrl = `${APP_URL.replace(/\/$/, "")}/hyr`;
  const loc = params.mailLocale === "en" ? "en" : "sq";

  const subject =
    loc === "sq" ? "Llogaria juaj në IT Arena u përditësua" : "Your IT Arena account was updated";

  const emailChangeBlockSq =
    params.emailChanged && params.previousEmail
      ? `<p><strong>Adresa e emailit për hyrje</strong> është ndryshuar nga <code>${escapeHtml(params.previousEmail)}</code> në <code>${escapeHtml(params.signInEmail)}</code>. Përdorni adresën e re për të hyrë.</p>`
      : params.emailChanged
        ? `<p><strong>Adresa e emailit për hyrje</strong> është përditësuar në <code>${escapeHtml(params.signInEmail)}</code>.</p>`
        : "";

  const emailChangeBlockEn =
    params.emailChanged && params.previousEmail
      ? `<p>Your <strong>sign-in email address</strong> was changed from <code>${escapeHtml(params.previousEmail)}</code> to <code>${escapeHtml(params.signInEmail)}</code>. Use the new address to sign in.</p>`
      : params.emailChanged
        ? `<p>Your <strong>sign-in email address</strong> was updated to <code>${escapeHtml(params.signInEmail)}</code>.</p>`
        : "";

  const pwdBlockSq = `<p><strong>Fjalëkalimi i përkohshëm:</strong> <code style="font-size:15px">${escapeHtml(params.temporaryPassword)}</code></p>
    <p>Ju lutemi hyni dhe ndryshoni fjalëkalimin sa më shpejt të jetë e mundur.</p>
    <p><a href="${loginUrl}">Hyr në portal</a></p>`;

  const pwdBlockEn = `<p><strong>Temporary password:</strong> <code style="font-size:15px">${escapeHtml(params.temporaryPassword)}</code></p>
    <p>Please sign in and change your password as soon as you can.</p>
    <p><a href="${loginUrl}">Sign in to the portal</a></p>`;

  const introSq = params.emailChanged
    ? `<p>Përshëndetje ${escapeHtml(params.firstName)},</p><p>Administratori përditësoi llogarinë tuaj të portalit.</p>${emailChangeBlockSq}<p><strong>Email për hyrje:</strong> ${escapeHtml(params.signInEmail)}</p>${pwdBlockSq}`
    : `<p>Përshëndetje ${escapeHtml(params.firstName)},</p><p>Administratori rivendosi fjalëkalimin e llogarisë suaj të portalit.</p><p><strong>Email për hyrje:</strong> ${escapeHtml(params.signInEmail)}</p>${pwdBlockSq}`;

  const introEn = params.emailChanged
    ? `<p>Hello ${escapeHtml(params.firstName)},</p><p>An administrator updated your portal account.</p>${emailChangeBlockEn}<p><strong>Sign-in email:</strong> ${escapeHtml(params.signInEmail)}</p>${pwdBlockEn}`
    : `<p>Hello ${escapeHtml(params.firstName)},</p><p>An administrator reset your portal account password.</p><p><strong>Sign-in email:</strong> ${escapeHtml(params.signInEmail)}</p>${pwdBlockEn}`;

  const html = loc === "en" ? introEn : introSq;
  const ok = await sendViaSmtp(params.to, subject, html);
  return ok ? { sent: true } : { sent: false };
}
