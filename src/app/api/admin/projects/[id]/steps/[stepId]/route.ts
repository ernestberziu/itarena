import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import {
  assertProjectAccess,
  updateProjectStepSchema,
  revalidateProjectPaths,
} from "@/lib/projects";
import type { ProjectStepStatus } from "@/lib/projects/step-types";

type Params = { params: Promise<{ id: string; stepId: string }> };

function serializeStep(step: {
  id: string;
  sortOrder: number;
  title: string;
  description: string | null;
  status: string;
  clientVisible: boolean;
  updatedAt: Date;
}) {
  return {
    id: step.id,
    sortOrder: step.sortOrder,
    title: step.title,
    description: step.description,
    status: step.status as ProjectStepStatus,
    clientVisible: step.clientVisible,
    updatedAt: step.updatedAt.toISOString(),
  };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "projects", "write");
  if (denied) return denied;

  const { id: projectId, stepId } = await params;
  const accessDenied = await assertProjectAccess(session.user.id, projectId, "write");
  if (accessDenied) return accessDenied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiErr(req, "invalidJson", 400);
  }

  const parsed = updateProjectStepSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const existing = await db.projectStep.findFirst({
    where: { id: stepId, projectId },
    select: { id: true },
  });
  if (!existing) return apiErr(req, "notFound", 404);

  const data: {
    title?: string;
    description?: string | null;
    status?: string;
    clientVisible?: boolean;
  } = {};

  if (parsed.data.title !== undefined) data.title = parsed.data.title.trim();
  if (parsed.data.description !== undefined) {
    data.description = parsed.data.description?.trim() || null;
  }
  if (parsed.data.status !== undefined) data.status = parsed.data.status;
  if (parsed.data.clientVisible !== undefined) data.clientVisible = parsed.data.clientVisible;

  const step = await db.projectStep.update({
    where: { id: stepId },
    data,
    select: {
      id: true,
      sortOrder: true,
      title: true,
      description: true,
      status: true,
      clientVisible: true,
      updatedAt: true,
    },
  });

  await db.project.update({
    where: { id: projectId },
    data: { updatedAt: new Date() },
  });

  const clientVisible = step.clientVisible;
  if (clientVisible || parsed.data.clientVisible !== undefined) {
    const { emitNotificationSafe } = await import("@/lib/notifications");
    emitNotificationSafe({
      type: "PROJECT_STEP_UPDATED",
      actorId: session.user.id,
      entity: { type: "project", id: projectId },
      payload: {
        projectId,
        stepTitle: step.title,
        status: step.status,
        clientVisible,
      },
    });
  }

  revalidateProjectPaths(projectId);
  return NextResponse.json(serializeStep(step));
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(_req, "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "projects", "write");
  if (denied) return denied;

  const { id: projectId, stepId } = await params;
  const accessDenied = await assertProjectAccess(session.user.id, projectId, "write");
  if (accessDenied) return accessDenied;

  const existing = await db.projectStep.findFirst({
    where: { id: stepId, projectId },
    select: { id: true },
  });
  if (!existing) return apiErr(_req, "notFound", 404);

  await db.projectStep.delete({ where: { id: stepId } });

  const remaining = await db.projectStep.findMany({
    where: { projectId },
    orderBy: { sortOrder: "asc" },
    select: { id: true },
  });
  await db.$transaction(
    remaining.map((s, i) =>
      db.projectStep.update({
        where: { id: s.id },
        data: { sortOrder: i },
      })
    )
  );

  await db.project.update({
    where: { id: projectId },
    data: { updatedAt: new Date() },
  });

  revalidateProjectPaths(projectId);
  return NextResponse.json({ ok: true });
}
