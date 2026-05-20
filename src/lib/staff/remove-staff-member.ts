import { Prisma, type PrismaClient } from "@prisma/client";

type DbTx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/** Unassigns active links, revokes access, and soft-deletes the staff user row. */
export async function removeStaffMember(userId: string, tx: DbTx) {
  await tx.ticket.updateMany({
    where: { assignedToId: userId },
    data: { assignedToId: null },
  });

  await tx.projectMember.deleteMany({ where: { userId } });

  await tx.projectClient.updateMany({
    where: { userId },
    data: { userId: null },
  });

  await tx.conversationParticipant.deleteMany({ where: { userId } });

  await tx.auditLog.updateMany({
    where: { actorId: userId },
    data: { actorId: null },
  });

  await tx.blogPost.updateMany({
    where: { authorId: userId },
    data: { authorId: null },
  });

  await tx.contractDocument.updateMany({
    where: { updatedById: userId },
    data: { updatedById: null },
  });

  await tx.session.deleteMany({ where: { userId } });
  await tx.account.deleteMany({ where: { userId } });
  await tx.notification.deleteMany({ where: { userId } });

  await tx.user.update({
    where: { id: userId },
    data: {
      deletedAt: new Date(),
      isActive: false,
      passwordHash: null,
      adminAclJson: Prisma.DbNull,
      email: `removed+${userId}@removed.local`,
      verifyToken: null,
      resetToken: null,
      resetTokenExpiry: null,
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
  });
}
