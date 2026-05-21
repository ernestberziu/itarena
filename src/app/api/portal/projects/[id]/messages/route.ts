import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { portalUser, PORTAL_ROLES } from "@/lib/portal/access";
import { assertPortalProjectAccess } from "@/lib/portal/project-access";
import { projectMessageSchema } from "@/lib/projects";
import { ensureProjectConversation } from "@/lib/messages/project-channel";
import { emitNotificationSafe } from "@/lib/notifications";
import { actorDisplayName, excerpt } from "@/lib/notifications/helpers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!PORTAL_ROLES.includes(session.user.role as (typeof PORTAL_ROLES)[number])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: projectId } = await params;
  const user = portalUser(session);
  const allowed = await assertPortalProjectAccess(user, projectId);
  if (!allowed) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const conv = await ensureProjectConversation(projectId, session.user.id);
  if (!conv) return NextResponse.json([]);

  const messages = await db.conversationMessage.findMany({
    where: { conversationId: conv.id, isInternal: false },
    select: {
      id: true,
      body: true,
      createdAt: true,
      guestAuthorName: true,
      author: { select: { id: true, firstName: true, lastName: true, role: true } },
    },
    orderBy: { createdAt: "asc" },
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
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!PORTAL_ROLES.includes(session.user.role as (typeof PORTAL_ROLES)[number])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: projectId } = await params;
  const user = portalUser(session);
  const allowed = await assertPortalProjectAccess(user, projectId);
  if (!allowed) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = projectMessageSchema.safeParse(
    typeof body === "object" && body !== null ? { ...(body as object), isInternal: false } : body
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const conv = await ensureProjectConversation(projectId, session.user.id);
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const message = await db.conversationMessage.create({
    data: {
      conversationId: conv.id,
      authorId: session.user.id,
      body: parsed.data.body.trim(),
      isInternal: false,
    },
    select: {
      id: true,
      body: true,
      createdAt: true,
      guestAuthorName: true,
      author: { select: { id: true, firstName: true, lastName: true, role: true } },
    },
  });

  await db.conversation.update({
    where: { id: conv.id },
    data: { lastMessageAt: message.createdAt },
  });

  await db.project.update({
    where: { id: projectId },
    data: { updatedAt: new Date() },
  });

  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { title: true },
  });
  const actorName = await actorDisplayName(session.user.id);
  emitNotificationSafe({
    type: "PROJECT_MESSAGE_ADDED",
    actorId: session.user.id,
    entity: { type: "project", id: projectId },
    payload: {
      projectId,
      title: project?.title,
      isInternal: false,
      actorName,
      excerpt: excerpt(message.body),
    },
  });

  return NextResponse.json(
    {
      id: message.id,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      author: message.author,
    },
    { status: 201 }
  );
}
