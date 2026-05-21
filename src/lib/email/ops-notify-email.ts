import "server-only";

/**
 * Shared inbox for ADMIN notification emails (albvisa NOTIFY_EMAIL pattern).
 * In-app bells still go to each admin user; email is sent once per event to this address.
 */
export function getOpsNotifyEmail(): string | null {
  const candidates = [
    process.env.NOTIFY_EMAIL,
    process.env.SMTP_FROM_EMAIL,
  ];
  for (const raw of candidates) {
    const s = raw?.trim();
    if (s && s.includes("@")) return s;
  }
  const smtpUser = process.env.SMTP_USER?.trim();
  if (smtpUser?.includes("@")) return smtpUser;
  return null;
}

export function hasOpsNotifyEmail(): boolean {
  return getOpsNotifyEmail() != null;
}
