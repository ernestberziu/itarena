import type { ClientResourceShareRecord } from "@/lib/public-share/types";

export type ShareAvailability =
  | { ok: true }
  | { ok: false; reason: "not_found" | "revoked" | "expired" | "locked" };

export function checkShareAvailability(
  share: ClientResourceShareRecord | null
): ShareAvailability {
  if (!share) return { ok: false, reason: "not_found" };
  if (share.revokedAt) return { ok: false, reason: "revoked" };
  if (share.expiresAt && share.expiresAt < new Date()) {
    return { ok: false, reason: "expired" };
  }
  if (share.lockedUntil && share.lockedUntil > new Date()) {
    return { ok: false, reason: "locked" };
  }
  return { ok: true };
}
