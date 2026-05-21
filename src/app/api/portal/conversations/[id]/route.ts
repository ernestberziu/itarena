import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import {
  assertConversationAccess,
  getConversationDetail,
} from "@/lib/messages";
import { toPortalConversationDetail } from "@/lib/messages/serialize-portal";
import { PORTAL_ROLES } from "@/lib/portal/access";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(_req, "unauthorized", 401);
  if (!PORTAL_ROLES.includes(session.user.role as (typeof PORTAL_ROLES)[number])) {
    return apiErr(_req, "forbidden", 403);
  }

  const { id } = await params;
  const accessDenied = await assertConversationAccess(session.user.id, id);
  if (accessDenied) return accessDenied;

  const conv = await getConversationDetail(id);
  if (!conv) return apiErr(_req, "notFound", 404);

  const locale = session.user.language === "en" ? "en" : "sq";
  return NextResponse.json(toPortalConversationDetail(conv, session.user.id, locale));
}
