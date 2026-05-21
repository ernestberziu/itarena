import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { sendPortalAccountInviteEmail } from "@/lib/portal-invite-email";

export type InvitePortalClientInput = {
  email: string;
  firstName: string;
  lastName: string;
  locale: "sq" | "en";
  ticketNumber?: string;
};

export function generatePortalTempPassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(14);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < 14; i++) out += chars[bytes[i]! % chars.length];
  return out;
}

export async function createInvitedPortalClient(
  input: InvitePortalClientInput
): Promise<
  | { userId: string; email: string; firstName: string; lastName: string; invite: { emailSent: true } }
  | {
      userId: string;
      email: string;
      firstName: string;
      lastName: string;
      invite: { emailSent: false; tempPassword: string };
    }
> {
  const email = input.email.trim().toLowerCase();
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) throw new Error("EMAIL_EXISTS");

  const tempPassword = generatePortalTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const user = await db.user.create({
    data: {
      email,
      firstName,
      lastName,
      passwordHash,
      role: "CLIENT",
      language: input.locale,
    },
    select: { id: true, email: true, firstName: true, lastName: true },
  });

  const emailResult = await sendPortalAccountInviteEmail({
    to: email,
    firstName,
    tempPassword,
    locale: input.locale,
    ticketNumber: input.ticketNumber,
  });

  if (emailResult.sent) {
    return {
      userId: user.id,
      email: user.email ?? email,
      firstName: user.firstName,
      lastName: user.lastName,
      invite: { emailSent: true },
    };
  }

  return {
    userId: user.id,
    email: user.email ?? email,
    firstName: user.firstName,
    lastName: user.lastName,
    invite: { emailSent: false, tempPassword },
  };
}
