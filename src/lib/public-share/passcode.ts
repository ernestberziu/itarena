import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

const PASSCODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const PASSCODE_LENGTH = 8;

export function generateShareToken(): string {
  return randomBytes(24).toString("base64url");
}

export function generatePasscode(): string {
  const bytes = randomBytes(PASSCODE_LENGTH);
  let out = "";
  for (let i = 0; i < PASSCODE_LENGTH; i++) {
    out += PASSCODE_CHARS[bytes[i]! % PASSCODE_CHARS.length];
  }
  return out;
}

export async function hashPasscode(plain: string): Promise<string> {
  return bcrypt.hash(plain.trim().toUpperCase(), 12);
}

export async function verifyPasscode(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain.trim().toUpperCase(), hash);
}
