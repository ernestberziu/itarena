import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertConversationAccess } from "@/lib/messages";
import { PORTAL_ROLES } from "@/lib/portal/access";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!PORTAL_ROLES.includes(session.user.role as (typeof PORTAL_ROLES)[number])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: conversationId } = await params;
  const accessDenied = await assertConversationAccess(session.user.id, conversationId);
  if (accessDenied) return accessDenied;

  await db.conversationParticipant.update({
    where: {
      conversationId_userId: { conversationId, userId: session.user.id },
    },
    data: { lastReadAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
