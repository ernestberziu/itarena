export const PUBLIC_SHARE_RESOURCE_TYPES = ["TICKET", "PROJECT"] as const;
export type PublicShareResourceType = (typeof PUBLIC_SHARE_RESOURCE_TYPES)[number];

export const PUBLIC_SHARE_DEFAULT_EXPIRY_DAYS = 90;
export const PUBLIC_SHARE_MAX_FAILED_ATTEMPTS = 5;
export const PUBLIC_SHARE_LOCK_MINUTES = 15;
export const PUBLIC_SHARE_COOKIE_NAME = "itarena_public_share";

export type ClientResourceShareRecord = {
  id: string;
  resourceType: string;
  ticketId: string | null;
  projectId: string | null;
  clientName: string;
  token: string;
  expiresAt: Date | null;
  revokedAt: Date | null;
  lockedUntil: Date | null;
  failedAttempts: number;
};
