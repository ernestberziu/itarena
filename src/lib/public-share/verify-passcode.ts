import { db } from "@/lib/db";
import { verifyPasscode } from "@/lib/public-share/passcode";
import {
  PUBLIC_SHARE_LOCK_MINUTES,
  PUBLIC_SHARE_MAX_FAILED_ATTEMPTS,
} from "@/lib/public-share/types";
import { checkShareAvailability } from "@/lib/public-share/share-status";
import {
  buildShareSessionValue,
  shareSessionCookieOptions,
} from "@/lib/public-share/session-cookie";

export type VerifyPasscodeResult =
  | { ok: true; cookie: ReturnType<typeof shareSessionCookieOptions> }
  | {
      ok: false;
      error: "not_found" | "revoked" | "expired" | "locked" | "invalid_passcode";
    };

export async function verifyPublicSharePasscode(
  token: string,
  passcode: string
): Promise<VerifyPasscodeResult> {
  const share = await db.clientResourceShare.findUnique({ where: { token } });
  const availability = checkShareAvailability(share);
  if (!availability.ok) {
    return { ok: false, error: availability.reason };
  }

  const valid = await verifyPasscode(passcode, share!.passcodeHash);
  if (!valid) {
    const failedAttempts = share!.failedAttempts + 1;
    const data: { failedAttempts: number; lockedUntil?: Date } = {
      failedAttempts,
    };
    if (failedAttempts >= PUBLIC_SHARE_MAX_FAILED_ATTEMPTS) {
      const lockedUntil = new Date();
      lockedUntil.setMinutes(lockedUntil.getMinutes() + PUBLIC_SHARE_LOCK_MINUTES);
      data.lockedUntil = lockedUntil;
    }
    await db.clientResourceShare.update({
      where: { id: share!.id },
      data,
    });
    return { ok: false, error: "invalid_passcode" };
  }

  await db.clientResourceShare.update({
    where: { id: share!.id },
    data: {
      failedAttempts: 0,
      lockedUntil: null,
      lastAccessAt: new Date(),
    },
  });

  const sessionValue = buildShareSessionValue(share!.id, share!.token);
  return {
    ok: true,
    cookie: shareSessionCookieOptions(sessionValue),
  };
}
