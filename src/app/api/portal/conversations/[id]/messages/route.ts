import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  assertConversationAccess,
  filterMessagesForViewer,
  sendMessageSchema,
} from "@/lib/messages";
import { toPortalMessageRow } from "@/lib/messages/serialize-portal";
import { PORTAL_ROLES } from "@/lib/portal/access";
import type { Role } from "@/types/domain";

type Params = { params: Promise<{ id: string }> };

const PAGE_SIZE = 50;

export async function GET(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);
  if (!PORTAL_ROLES.includes(session.user.role as (typeof PORTAL_ROLES)[number])) {
    return apiErr(req, "forbidden", 403);
  }

  const { id: conversationId } = await params;
  const accessDenied = await assertConversationAccess(session.user.id, conversationId);
  if (accessDenied) return accessDenied;

  const { searchParams } = new URL(req.url);
  const since = searchParams.get("since");
  const cursor = searchParams.get("cursor");

  const where = {
    conversationId,
    isInternal: false,
    ...(since ? { createdAt: { gt: new Date(since) } } : {}),
    ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
  };

  const messages = await db.conversationMessage.findMany({
    where,
    orderBy: { createdAt: since ? "asc" : "desc" },
    take: since ? undefined : PAGE_SIZE,
    include: {
      author: { select: { id: true, firstName: true, lastName: true, role: true } },
    },
  });

  const ordered = since ? messages : [...messages].reverse();
  const filtered = filterMessagesForViewer(ordered, session.user.role as Role);

  return NextResponse.json({
    items: filtered.map(toPortalMessageRow),
    hasMore: !since && messages.length === PAGE_SIZE,
  });
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);
  if (!PORTAL_ROLES.includes(session.user.role as (typeof PORTAL_ROLES)[number])) {
    return apiErr(req, "forbidden", 403);
  }

  const { id: conversationId } = await params;
  const accessDenied = await assertConversationAccess(session.user.id, conversationId);
  if (accessDenied) return accessDenied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiErr(req, "invalidJson", 400);
  }

  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { type: true, projectId: true },
  });
  if (!conversation) {
    return apiErr(req, "notFound", 404);
  }

  const message = await db.conversationMessage.create({
    data: {
      conversationId,
      authorId: session.user.id,
      body: parsed.data.body.trim(),
      isInternal: false,
    },
    include: {
      author: { select: { id: true, firstName: true, lastName: true, role: true } },
    },
  });

  await db.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: message.createdAt },
  });

  if (conversation.type === "PROJECT" && conversation.projectId) {
    await db.project.update({
      where: { id: conversation.projectId },
      data: { updatedAt: new Date() },
    });
  }

  await db.conversationParticipant.update({
    where: {
      conversationId_userId: { conversationId, userId: session.user.id },
    },
    data: { lastReadAt: message.createdAt },
  });

  const { emitNotificationSafe } = await import("@/lib/notifications");
  const { actorDisplayName, excerpt } = await import("@/lib/notifications/helpers");
  const actorName = await actorDisplayName(session.user.id);
  const eventType =
    conversation.type === "PROJECT" && conversation.projectId
      ? ("PROJECT_MESSAGE_ADDED" as const)
      : ("CONVERSATION_MESSAGE_ADDED" as const);
  emitNotificationSafe({
    type: eventType,
    actorId: session.user.id,
    entity:
      conversation.projectId
        ? { type: "project", id: conversation.projectId }
        : { type: "conversation", id: conversationId },
    payload: {
      conversationId,
      projectId: conversation.projectId ?? undefined,
      isInternal: false,
      actorName,
      excerpt: excerpt(message.body),
    },
  });

  return NextResponse.json(toPortalMessageRow(message), { status: 201 });
}
