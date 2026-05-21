import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertConversationAccess } from "@/lib/messages";
import { PORTAL_ROLES } from "@/lib/portal/access";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(_req, "unauthorized", 401);
  if (!PORTAL_ROLES.includes(session.user.role as (typeof PORTAL_ROLES)[number])) {
    return apiErr(_req, "forbidden", 403);
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
