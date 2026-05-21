import { db } from "@/lib/db";
import { sendPublicShareAccessEmail } from "@/lib/email/transactional";
import { publicShareUrl } from "@/lib/public-share/urls";
import type { PublicShareResourceType } from "@/lib/public-share/types";

export async function sendShareAccessEmail(shareId: string): Promise<{ sent: boolean; reason?: string }> {
  const share = await db.clientResourceShare.findUnique({
    where: { id: shareId },
    select: {
      id: true,
      resourceType: true,
      token: true,
      clientName: true,
      recipientEmail: true,
      passcodePlain: true,
      revokedAt: true,
      ticket: { select: { number: true, title: true } },
      project: { select: { title: true } },
    },
  });

  if (!share || share.revokedAt) {
    return { sent: false, reason: "NOT_FOUND" };
  }

  const email = share.recipientEmail?.trim();
  if (!email) {
    return { sent: false, reason: "NO_EMAIL" };
  }

  const resourceType = share.resourceType as PublicShareResourceType;
  const resourceLabel =
    resourceType === "TICKET"
      ? share.ticket
        ? `Ticket ${share.ticket.number}`
        : "Ticket"
      : share.project?.title ?? "Project";

  const result = await sendPublicShareAccessEmail({
    to: email,
    clientName: share.clientName,
    resourceLabel,
    shareUrl: publicShareUrl(resourceType, share.token),
    passcode: share.passcodePlain,
  });

  return result.sent ? { sent: true } : { sent: false, reason: "SMTP_FAILED" };
}
