import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import {
  assertProjectAccess,
  projectMessageSchema,
  revalidateProjectPaths,
} from "@/lib/projects";
import { ensureProjectConversation } from "@/lib/messages/project-channel";
import { isStaffRole } from "@/lib/messages";
import { emitNotificationSafe } from "@/lib/notifications";
import { actorDisplayName, excerpt } from "@/lib/notifications/helpers";

type Params = { params: Promise<{ id: string }> };

/** Legacy wrapper — posts to the project's conversation channel. */
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "projects", "read");
  if (denied) return denied;

  const { id: projectId } = await params;
  const accessDenied = await assertProjectAccess(session.user.id, projectId, "read");
  if (accessDenied) return accessDenied;

  const conv = await ensureProjectConversation(projectId, session.user.id);
  if (!conv) return NextResponse.json([]);

  const viewer = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  const staff = isStaffRole(viewer?.role ?? "");

  const messages = await db.conversationMessage.findMany({
    where: {
      conversationId: conv.id,
      ...(staff ? {} : { isInternal: false }),
    },
    include: {
      author: { select: { id: true, firstName: true, lastName: true, role: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(
    messages.map((m) => ({
      id: m.id,
      body: m.body,
      isInternal: m.isInternal,
      createdAt: m.createdAt.toISOString(),
      author: m.author,
    }))
  );
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "projects", "write");
  if (denied) return denied;

  const { id: projectId } = await params;
  const accessDenied = await assertProjectAccess(session.user.id, projectId, "write");
  if (accessDenied) return accessDenied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = projectMessageSchema.safeParse(body);
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
      isInternal: parsed.data.isInternal ?? false,
    },
    include: {
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
      isInternal: message.isInternal,
      actorName,
      excerpt: excerpt(message.body),
    },
  });

  revalidateProjectPaths(projectId);
  return NextResponse.json(
    {
      id: message.id,
      body: message.body,
      isInternal: message.isInternal,
      createdAt: message.createdAt.toISOString(),
      author: message.author,
    },
    { status: 201 }
  );
}
