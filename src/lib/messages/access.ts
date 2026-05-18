import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { STAFF_ROLES, type Role } from "@/types/domain";

export function isStaffRole(role: string): boolean {
  return STAFF_ROLES.includes(role as (typeof STAFF_ROLES)[number]);
}

export async function isConversationParticipant(
  userId: string,
  conversationId: string
): Promise<boolean> {
  const row = await db.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
    select: { id: true },
  });
  return Boolean(row);
}

export async function getParticipantStaffFlag(
  userId: string,
  conversationId: string
): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user) return false;
  if (!isStaffRole(user.role)) return false;
  return isConversationParticipant(userId, conversationId);
}

export async function canMessageUser(actorId: string, targetUserId: string): Promise<boolean> {
  if (actorId === targetUserId) return false;

  const [actor, target] = await Promise.all([
    db.user.findUnique({ where: { id: actorId }, select: { role: true, isActive: true } }),
    db.user.findUnique({ where: { id: targetUserId }, select: { role: true, isActive: true } }),
  ]);
  if (!actor?.isActive || !target?.isActive) return false;

  const actorStaff = isStaffRole(actor.role);
  const targetStaff = isStaffRole(target.role);

  if (actorStaff) return true;
  if (targetStaff) return true;
  return false;
}

export async function assertConversationAccess(
  userId: string,
  conversationId: string
): Promise<NextResponse | null> {
  const ok = await isConversationParticipant(userId, conversationId);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return null;
}

export function messageVisibleToUser(
  msg: { isInternal: boolean },
  viewerRole: Role
): boolean {
  if (!msg.isInternal) return true;
  return isStaffRole(viewerRole);
}
