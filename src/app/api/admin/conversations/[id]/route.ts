import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import {
  assertConversationAccess,
  canMessageUser,
  getConversationDetail,
  toConversationDetail,
  updateConversationSchema,
} from "@/lib/messages";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "messages", "read");
  if (denied) return denied;

  const { id } = await params;
  const accessDenied = await assertConversationAccess(session.user.id, id);
  if (accessDenied) return accessDenied;

  const conv = await getConversationDetail(id);
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const locale = session.user.language === "en" ? "en" : "sq";
  return NextResponse.json(toConversationDetail(conv, session.user.id, locale));
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "messages", "write");
  if (denied) return denied;

  const { id } = await params;
  const accessDenied = await assertConversationAccess(session.user.id, id);
  if (accessDenied) return accessDenied;

  const conv = await db.conversation.findUnique({
    where: { id },
    select: { type: true },
  });
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (conv.type !== "GROUP") {
    return NextResponse.json({ error: "Only group conversations can be updated" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateConversationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { title, addParticipantIds, removeParticipantIds } = parsed.data;

  if (title?.trim()) {
    await db.conversation.update({ where: { id }, data: { title: title.trim() } });
  }

  if (removeParticipantIds?.length) {
    await db.conversationParticipant.deleteMany({
      where: { conversationId: id, userId: { in: removeParticipantIds } },
    });
  }

  if (addParticipantIds?.length) {
    const unique = [...new Set(addParticipantIds)];
    for (const userId of unique) {
      const allowed = await canMessageUser(session.user.id, userId);
      if (!allowed) {
        return NextResponse.json(
          { error: "Cannot add one or more users" },
          { status: 400 }
        );
      }
    }
    await db.conversationParticipant.createMany({
      data: unique.map((userId) => ({
        conversationId: id,
        userId,
        role: "member",
      })),
      skipDuplicates: true,
    });
  }

  const updated = await getConversationDetail(id);
  const locale = session.user.language === "en" ? "en" : "sq";
  return NextResponse.json(toConversationDetail(updated!, session.user.id, locale));
}
