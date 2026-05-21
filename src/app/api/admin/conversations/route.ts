import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { canAccessProject } from "@/lib/projects/access";
import {
  createConversationSchema,
  createDirectConversation,
  createGroupConversation,
  listConversationsQuerySchema,
  listInboxConversations,
  toConversationListRow,
} from "@/lib/messages";
import {
  ensureProjectConversation,
  syncAccessibleProjectChannels,
} from "@/lib/messages/project-channel";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "messages", "read");
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const parsed = listConversationsQuerySchema.safeParse({
    projectId: searchParams.get("projectId") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    page: searchParams.get("page") ?? 1,
    pageSize: searchParams.get("pageSize") ?? 25,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const { projectId, type, q, page, pageSize } = parsed.data;
  const listType = projectId ? "PROJECT" : type;
  if (projectId) {
    const ok = await canAccessProject(session.user.id, projectId, "read");
    if (!ok) return apiErr(req, "notFound", 404);
    await ensureProjectConversation(projectId, session.user.id);
  } else {
    await syncAccessibleProjectChannels(session.user.id);
  }

  const locale = session.user.language === "en" ? "en" : "sq";
  const skip = (page - 1) * pageSize;
  const { items, total, unreadCounts } = await listInboxConversations(session.user.id, {
    projectId,
    type: listType,
    q,
    skip,
    take: pageSize,
  });

  const rows = items.map((c, i) =>
    toConversationListRow(c, session.user.id, locale, unreadCounts[i] ?? 0)
  );

  return NextResponse.json({
    items: rows,
    total,
    page,
    pageSize,
    hasMore: skip + items.length < total,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "messages", "write");
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiErr(req, "invalidJson", 400);
  }

  const parsed = createConversationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { type, title, participantIds, projectId } = parsed.data;
  if (projectId) {
    const ok = await canAccessProject(session.user.id, projectId, "read");
    if (!ok) return apiErr(req, "notFound", 404);
  }

  try {
    if (type === "DIRECT") {
      const conv = await createDirectConversation(session.user.id, participantIds[0]!);
      return NextResponse.json({ id: conv.id }, { status: 201 });
    }
    const conv = await createGroupConversation(
      session.user.id,
      title!.trim(),
      participantIds
    );
    return NextResponse.json({ id: conv.id }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "CANNOT_MESSAGE_USER") {
      return NextResponse.json({ error: "Cannot message one or more users" }, { status: 400 });
    }
    throw err;
  }
}
