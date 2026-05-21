import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { assertPublicShareAccess } from "@/lib/public-share/assert-share-access";
import { ensureProjectConversation } from "@/lib/messages/project-channel";

const schema = z.object({
  body: z.string().min(1),
});

type Params = { params: Promise<{ token: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;
  const access = await assertPublicShareAccess(token);
  if (!access.ok) return NextResponse.json({ error: access.reason }, { status: 404 });

  const { share } = access;
  if (share.resourceType !== "PROJECT" || !share.projectId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const project = await db.project.findUnique({
    where: { id: share.projectId },
    select: { id: true, createdById: true },
  });
  if (!project) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const conv = await ensureProjectConversation(project.id, project.createdById);
  if (!conv) return NextResponse.json([]);

  const messages = await db.conversationMessage.findMany({
    where: { conversationId: conv.id, isInternal: false },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      body: true,
      createdAt: true,
      guestAuthorName: true,
      author: { select: { id: true, firstName: true, lastName: true, role: true } },
    },
  });

  return NextResponse.json(
    messages.map((m) => ({
      id: m.id,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
      guestAuthorName: m.guestAuthorName,
      author: m.author,
    }))
  );
}

export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params;
  const access = await assertPublicShareAccess(token);
  if (!access.ok) return NextResponse.json({ error: access.reason }, { status: 404 });

  const { share } = access;
  if (share.resourceType !== "PROJECT" || !share.projectId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const project = await db.project.findUnique({
    where: { id: share.projectId },
    select: { id: true, createdById: true },
  });
  if (!project) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const conv = await ensureProjectConversation(project.id, project.createdById);
  if (!conv) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const message = await db.conversationMessage.create({
    data: {
      conversationId: conv.id,
      authorId: null,
      guestAuthorName: share.clientName,
      publicShareId: share.id,
      body: parsed.data.body.trim(),
      isInternal: false,
    },
    select: {
      id: true,
      body: true,
      createdAt: true,
      guestAuthorName: true,
    },
  });

  await db.conversation.update({
    where: { id: conv.id },
    data: { lastMessageAt: new Date() },
  });

  const projectMeta = await db.project.findUnique({
    where: { id: project.id },
    select: { id: true, title: true },
  });
  const { emitNotificationSafe } = await import("@/lib/notifications");
  const { excerpt } = await import("@/lib/notifications/helpers");
  emitNotificationSafe({
    type: "PUBLIC_SHARE_GUEST_COMMENT",
    entity: { type: "project", id: project.id },
    payload: {
      projectId: project.id,
      title: projectMeta?.title,
      clientName: share.clientName,
      excerpt: excerpt(parsed.data.body),
    },
  });

  return NextResponse.json(
    {
      id: message.id,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      guestAuthorName: message.guestAuthorName,
      author: null,
    },
    { status: 201 }
  );
}
