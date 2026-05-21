import nodemailer from "nodemailer";

export function smtpAuthMailboxAddress(): string | undefined {
  const u = process.env.SMTP_USER?.trim();
  if (!u?.includes("@")) return undefined;
  return u;
}

export function smtpFromAddress(): string | undefined {
  const explicit = process.env.SMTP_FROM_EMAIL?.trim();
  if (explicit) return explicit;
  return smtpAuthMailboxAddress();
}

export function smtpFromName(): string {
  return process.env.SMTP_FROM_NAME?.trim() || "IT Arena";
}

export function isSmtpConfigured(): boolean {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = smtpFromAddress();
  return Boolean(host && user && pass && from);
}

export function mailTransport() {
  const host = process.env.SMTP_HOST?.trim();
  if (!host) return null;

  const portRaw = process.env.SMTP_PORT?.trim();
  const port = portRaw ? Number.parseInt(portRaw, 10) : 587;
  if (Number.isNaN(port) || port < 1) return null;

  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  const secureEnv = process.env.SMTP_SECURE?.trim().toLowerCase();
  const secure = secureEnv === "true" || secureEnv === "1" || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure && port === 587,
    auth: user && pass ? { user, pass } : undefined,
  });
}

export function fromAddress(): { name: string; address: string } {
  const address = smtpFromAddress() ?? "noreply@itarena.al";
  return { name: smtpFromName(), address };
}
