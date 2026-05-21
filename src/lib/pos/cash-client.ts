import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const POS_CASH_CLIENT_EMAIL = "pos-cash@itarena.internal";

/** System user for walk-in / cash POS sales (no registered portal account). */
export async function getOrCreatePosCashClientUserId(): Promise<string> {
  const existing = await db.user.findUnique({
    where: { email: POS_CASH_CLIENT_EMAIL },
    select: { id: true },
  });
  if (existing) return existing.id;

  const passwordHash = await bcrypt.hash(crypto.randomUUID(), 10);
  const created = await db.user.create({
    data: {
      email: POS_CASH_CLIENT_EMAIL,
      passwordHash,
      firstName: "Klient",
      lastName: "me para në dorë",
      role: "CLIENT",
      isActive: true,
      phone: null,
    },
    select: { id: true },
  });
  return created.id;
}

export function posCashClientDisplayName(locale: string): string {
  return locale === "en" ? "Cash client" : "Klient me para në dorë";
}
