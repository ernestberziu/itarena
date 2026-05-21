import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import {
  PUBLIC_SHARE_COOKIE_NAME,
  type ClientResourceShareRecord,
} from "@/lib/public-share/types";

const SESSION_DAYS = 7;

function getSecret(): string {
  const secret =
    process.env.AUTH_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim();
  if (!secret) throw new Error("AUTH_SECRET is required for public share sessions");
  return secret;
}

function signPayload(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function buildShareSessionValue(shareId: string, token: string): string {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${shareId}:${token}:${exp}`;
  const sig = signPayload(payload);
  return `${payload}:${sig}`;
}

export function parseShareSessionValue(
  value: string | undefined
): { shareId: string; token: string } | null {
  if (!value) return null;
  const parts = value.split(":");
  if (parts.length !== 4) return null;
  const [shareId, token, expStr, sig] = parts;
  if (!shareId || !token || !expStr || !sig) return null;
  const payload = `${shareId}:${token}:${expStr}`;
  const expected = signPayload(payload);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return null;
  return { shareId, token };
}

export async function getShareSessionFromCookies(): Promise<{
  shareId: string;
  token: string;
} | null> {
  const store = await cookies();
  const raw = store.get(PUBLIC_SHARE_COOKIE_NAME)?.value;
  return parseShareSessionValue(raw);
}

export function shareSessionCookieOptions(value: string) {
  return {
    name: PUBLIC_SHARE_COOKIE_NAME,
    value,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}

export function sessionMatchesShare(
  session: { shareId: string; token: string } | null,
  share: Pick<ClientResourceShareRecord, "id" | "token">
): boolean {
  return session?.shareId === share.id && session?.token === share.token;
}
