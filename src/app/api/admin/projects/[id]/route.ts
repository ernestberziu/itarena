import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import {
  assertProjectAccess,
  updateProjectSchema,
  projectDetailInclude,
  revalidateProjectPaths,
} from "@/lib/projects";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(_req, "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "projects", "read");
  if (denied) return denied;

  const { id } = await params;
  const accessDenied = await assertProjectAccess(session.user.id, id, "read");
  if (accessDenied) return accessDenied;

  const project = await db.project.findUnique({
    where: { id },
    include: projectDetailInclude,
  });
  if (!project) return apiErr(_req, "notFound", 404);

  return NextResponse.json(project);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "projects", "write");
  if (denied) return denied;

  const { id } = await params;
  const accessDenied = await assertProjectAccess(session.user.id, id, "write");
  if (accessDenied) return accessDenied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiErr(req, "invalidJson", 400);
  }

  const parsed = updateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const project = await db.project.update({
    where: { id },
    data: {
      ...(parsed.data.title !== undefined ? { title: parsed.data.title.trim() } : {}),
      ...(parsed.data.description !== undefined
        ? { description: parsed.data.description?.trim() || null }
        : {}),
      ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
    },
    include: projectDetailInclude,
  });

  const { emitNotificationSafe } = await import("@/lib/notifications");
  emitNotificationSafe({
    type: "PROJECT_UPDATED",
    actorId: session.user.id,
    entity: { type: "project", id },
    payload: { projectId: id, title: project.title },
  });

  revalidateProjectPaths(id);
  return NextResponse.json(project);
}
