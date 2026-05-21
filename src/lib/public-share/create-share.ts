import { db } from "@/lib/db";
import {
  generatePasscode,
  generateShareToken,
  hashPasscode,
} from "@/lib/public-share/passcode";
import {
  PUBLIC_SHARE_DEFAULT_EXPIRY_DAYS,
  type PublicShareResourceType,
} from "@/lib/public-share/types";
import { publicShareUrl } from "@/lib/public-share/urls";

export type CreatePublicShareInput = {
  resourceType: PublicShareResourceType;
  ticketId?: string;
  projectId?: string;
  clientName: string;
  recipientEmail?: string | null;
  createdById: string;
  expiresInDays?: number;
};

export type CreatePublicShareResult = {
  id: string;
  token: string;
  passcode: string;
  url: string;
  clientName: string;
  expiresAt: string | null;
};

export async function createPublicShare(
  input: CreatePublicShareInput
): Promise<CreatePublicShareResult> {
  const clientName = input.clientName.trim();
  if (!clientName) throw new Error("CLIENT_NAME_REQUIRED");

  if (input.resourceType === "TICKET" && !input.ticketId) {
    throw new Error("TICKET_ID_REQUIRED");
  }
  if (input.resourceType === "PROJECT" && !input.projectId) {
    throw new Error("PROJECT_ID_REQUIRED");
  }

  const token = generateShareToken();
  const passcode = generatePasscode();
  const passcodeHash = await hashPasscode(passcode);

  const days = input.expiresInDays ?? PUBLIC_SHARE_DEFAULT_EXPIRY_DAYS;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  const share = await db.clientResourceShare.create({
    data: {
      resourceType: input.resourceType,
      ticketId: input.resourceType === "TICKET" ? input.ticketId : null,
      projectId: input.resourceType === "PROJECT" ? input.projectId : null,
      clientName,
      recipientEmail: input.recipientEmail?.trim().toLowerCase() || null,
      token,
      passcodeHash,
      passcodePlain: passcode,
      expiresAt,
      createdById: input.createdById,
    },
  });

  return {
    id: share.id,
    token: share.token,
    passcode,
    url: publicShareUrl(input.resourceType, share.token),
    clientName: share.clientName,
    expiresAt: share.expiresAt?.toISOString() ?? null,
  };
}

export async function regeneratePublicSharePasscode(shareId: string): Promise<{
  passcode: string;
}> {
  const passcode = generatePasscode();
  const passcodeHash = await hashPasscode(passcode);
  await db.clientResourceShare.update({
    where: { id: shareId },
    data: {
      passcodeHash,
      passcodePlain: passcode,
      failedAttempts: 0,
      lockedUntil: null,
    },
  });
  return { passcode };
}
