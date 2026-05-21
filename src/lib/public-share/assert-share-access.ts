import { db } from "@/lib/db";
import {
  getShareSessionFromCookies,
  sessionMatchesShare,
} from "@/lib/public-share/session-cookie";
import { checkShareAvailability } from "@/lib/public-share/share-status";
import type { ClientResourceShareRecord } from "@/lib/public-share/types";

export type AssertedPublicShare = ClientResourceShareRecord & {
  passcodeHash: string;
};

export async function loadShareByToken(
  token: string
): Promise<AssertedPublicShare | null> {
  return db.clientResourceShare.findUnique({ where: { token } });
}

export async function assertPublicShareAccess(
  token: string
): Promise<
  | { ok: true; share: AssertedPublicShare }
  | { ok: false; reason: "not_found" | "revoked" | "expired" | "locked" | "unauthorized" }
> {
  const share = await loadShareByToken(token);
  const availability = checkShareAvailability(share);
  if (!availability.ok) {
    return { ok: false, reason: availability.reason };
  }

  const session = await getShareSessionFromCookies();
  if (!sessionMatchesShare(session, share!)) {
    return { ok: false, reason: "unauthorized" };
  }

  await db.clientResourceShare.update({
    where: { id: share!.id },
    data: { lastAccessAt: new Date() },
  });

  return { ok: true, share: share! };
}

export function toShareListItem(share: {
  id: string;
  clientName: string;
  recipientEmail?: string | null;
  token: string;
  passcodePlain: string;
  resourceType: string;
  expiresAt: Date | null;
  revokedAt: Date | null;
  lastAccessAt: Date | null;
  createdAt: Date;
}) {
  return {
    id: share.id,
    clientName: share.clientName,
    recipientEmail: share.recipientEmail ?? null,
    token: share.token,
    passcode: share.passcodePlain || null,
    resourceType: share.resourceType,
    expiresAt: share.expiresAt?.toISOString() ?? null,
    revokedAt: share.revokedAt?.toISOString() ?? null,
    lastAccessAt: share.lastAccessAt?.toISOString() ?? null,
    createdAt: share.createdAt.toISOString(),
    isActive: !share.revokedAt && (!share.expiresAt || share.expiresAt > new Date()),
  };
}
