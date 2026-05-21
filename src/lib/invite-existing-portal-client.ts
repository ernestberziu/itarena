import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import {
  sendAdminClientAccountUpdateEmail,
  sendPortalAccountInviteEmail,
} from "@/lib/portal-invite-email";

const CLIENT_ROLES = ["CLIENT", "COMPANY_ADMIN"] as const;

export type InviteExistingPortalClientInput = {
  userId: string;
  email: string;
  locale: "sq" | "en";
  notifyCustomer?: boolean;
};

export type InviteExistingPortalClientResult = {
  credentialsEmailSent: boolean;
  notifyEmailAttempted: boolean;
  temporaryPassword?: string;
  isFirstInvite: boolean;
};

function generateTemporaryPassword(): string {
  return randomBytes(14).toString("base64url").replace(/=/g, "").slice(0, 20);
}

export async function inviteExistingPortalClient(
  input: InviteExistingPortalClientInput
): Promise<InviteExistingPortalClientResult> {
  const email = input.email.trim().toLowerCase();
  const notifyCustomer = input.notifyCustomer !== false;

  const user = await db.user.findFirst({
    where: { id: input.userId, role: { in: [...CLIENT_ROLES] } },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      firstName: true,
      lastName: true,
      language: true,
      isActive: true,
    },
  });

  if (!user) throw new Error("NOT_FOUND");
  if (!user.isActive) throw new Error("INACTIVE");

  const dup = await db.user.findFirst({
    where: { email, NOT: { id: user.id } },
    select: { id: true },
  });
  if (dup) throw new Error("EMAIL_EXISTS");

  const isFirstInvite = !user.email || !user.passwordHash;
  const plainPassword = generateTemporaryPassword();
  const passwordHash = await bcrypt.hash(plainPassword, 12);
  const mailLocale = user.language === "en" ? "en" : input.locale;

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        email,
        passwordHash,
        emailVerified: null,
      },
    });
    await tx.session.deleteMany({ where: { userId: user.id } });
  });

  if (!notifyCustomer) {
    return {
      credentialsEmailSent: false,
      notifyEmailAttempted: false,
      temporaryPassword: plainPassword,
      isFirstInvite,
    };
  }

  let credentialsEmailSent = false;
  if (isFirstInvite) {
    const mail = await sendPortalAccountInviteEmail({
      to: email,
      firstName: user.firstName,
      tempPassword: plainPassword,
      locale: mailLocale,
    });
    credentialsEmailSent = mail.sent;
  } else {
    const mail = await sendAdminClientAccountUpdateEmail({
      to: email,
      firstName: user.firstName,
      mailLocale,
      temporaryPassword: plainPassword,
      signInEmail: email,
      emailChanged: user.email != null && user.email.toLowerCase() !== email,
      previousEmail: user.email ?? undefined,
    });
    credentialsEmailSent = mail.sent;
  }

  return {
    credentialsEmailSent,
    notifyEmailAttempted: true,
    temporaryPassword: credentialsEmailSent ? undefined : plainPassword,
    isFirstInvite,
  };
}
