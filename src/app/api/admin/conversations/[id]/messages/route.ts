import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import {
  assertConversationAccess,
  filterMessagesForViewer,
  isStaffRole,
  sendMessageSchema,
  toMessageRow,
} from "@/lib/messages";
import type { Role } from "@/types/domain";

type Params = { params: Promise<{ id: string }> };

const PAGE_SIZE = 50;

export async function GET(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "messages", "read");
  if (denied) return denied;

  const { id: conversationId } = await params;
  const accessDenied = await assertConversationAccess(session.user.id, conversationId);
  if (accessDenied) return accessDenied;

  const { searchParams } = new URL(req.url);
  const since = searchParams.get("since");
  const cursor = searchParams.get("cursor");

  const viewer = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  const viewerRole = (viewer?.role ?? "CLIENT") as Role;

  const where = {
    conversationId,
    ...(since ? { createdAt: { gt: new Date(since) } } : {}),
    ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
    ...(!isStaffRole(viewerRole) ? { isInternal: false } : {}),
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
  const filtered = filterMessagesForViewer(ordered, viewerRole);

  return NextResponse.json({
    items: filtered.map(toMessageRow),
    hasMore: !since && messages.length === PAGE_SIZE,
  });
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "messages", "write");
  if (denied) return denied;

  const { id: conversationId } = await params;
  const accessDenied = await assertConversationAccess(session.user.id, conversationId);
  if (accessDenied) return accessDenied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
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
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const viewer = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  const isInternal =
    conversation.type === "PROJECT" && Boolean(parsed.data.isInternal);

  if (isInternal && !isStaffRole(viewer?.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const message = await db.conversationMessage.create({
    data: {
      conversationId,
      authorId: session.user.id,
      body: parsed.data.body.trim(),
      isInternal,
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

  return NextResponse.json(toMessageRow(message), { status: 201 });
}
