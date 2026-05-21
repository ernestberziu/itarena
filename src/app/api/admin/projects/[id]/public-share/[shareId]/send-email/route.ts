import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { assertProjectAccess } from "@/lib/projects";
import { sendShareAccessEmail } from "@/lib/public-share/send-share-email";

type Params = { params: Promise<{ id: string; shareId: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(_req, "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "projects", "write");
  if (denied) return denied;

  const { id: projectId, shareId } = await params;
  const accessDenied = await assertProjectAccess(session.user.id, projectId, "write");
  if (accessDenied) return accessDenied;

  const share = await db.clientResourceShare.findFirst({
    where: { id: shareId, projectId, resourceType: "PROJECT" },
    select: { id: true },
  });
  if (!share) return apiErr(_req, "notFound", 404);

  const result = await sendShareAccessEmail(shareId);
  if (result.reason === "NO_EMAIL") {
    return NextResponse.json({ error: "No recipient email on this link" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, emailSent: result.sent });
}
