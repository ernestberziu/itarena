import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import {
  listConversationsQuerySchema,
  listInboxConversations,
} from "@/lib/messages";
import { syncPortalProjectChannels } from "@/lib/messages/portal-channels";
import { toPortalConversationListRow } from "@/lib/messages/serialize-portal";
import { PORTAL_ROLES, portalUser } from "@/lib/portal/access";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);
  if (!PORTAL_ROLES.includes(session.user.role as (typeof PORTAL_ROLES)[number])) {
    return apiErr(req, "forbidden", 403);
  }

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

  const user = portalUser(session);
  await syncPortalProjectChannels(user);

  const { projectId, type, q, page, pageSize } = parsed.data;
  const locale = session.user.language === "en" ? "en" : "sq";
  const skip = (page - 1) * pageSize;
  const { items, total, unreadCounts } = await listInboxConversations(session.user.id, {
    projectId,
    type,
    q,
    skip,
    take: pageSize,
  });

  const rows = items.map((c, i) =>
    toPortalConversationListRow(c, session.user.id, locale, unreadCounts[i] ?? 0)
  );

  return NextResponse.json({
    items: rows,
    total,
    page,
    pageSize,
    hasMore: skip + items.length < total,
  });
}
