import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { assertProjectAccess } from "@/lib/projects";
import { regeneratePublicSharePasscode } from "@/lib/public-share/create-share";

type Params = { params: Promise<{ id: string; shareId: string }> };

async function assertProjectShareAccess(
  userId: string,
  projectId: string,
  shareId: string
) {
  const accessDenied = await assertProjectAccess(userId, projectId, "write");
  if (accessDenied) return null;

  return db.clientResourceShare.findFirst({
    where: { id: shareId, projectId, resourceType: "PROJECT" },
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "projects", "write");
  if (denied) return denied;

  const { id: projectId, shareId } = await params;
  const share = await assertProjectShareAccess(session.user.id, projectId, shareId);
  if (!share) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.clientResourceShare.update({
    where: { id: shareId },
    data: { revokedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "projects", "write");
  if (denied) return denied;

  const { id: projectId, shareId } = await params;
  const share = await assertProjectShareAccess(session.user.id, projectId, shareId);
  if (!share) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  if (body?.action !== "regenerate_passcode") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { passcode } = await regeneratePublicSharePasscode(shareId);
  return NextResponse.json({ passcode });
}
