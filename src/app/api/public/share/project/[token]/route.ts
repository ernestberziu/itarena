import { NextRequest, NextResponse } from "next/server";
import { assertPublicShareAccess } from "@/lib/public-share/assert-share-access";
import { loadPublicShareProject } from "@/lib/public-share/load-project";

type Params = { params: Promise<{ token: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;
  const access = await assertPublicShareAccess(token);
  if (!access.ok) return NextResponse.json({ error: access.reason }, { status: 404 });

  const { share } = access;
  if (share.resourceType !== "PROJECT" || !share.projectId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const project = await loadPublicShareProject(share.projectId);
  if (!project) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json({
    clientName: share.clientName,
    project,
  });
}
