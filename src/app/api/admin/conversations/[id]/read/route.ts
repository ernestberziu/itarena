import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { assertConversationAccess } from "@/lib/messages";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(_req, "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "messages", "read");
  if (denied) return denied;

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
