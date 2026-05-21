import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import {
  assertProjectAccess,
  createProjectStepSchema,
  revalidateProjectPaths,
} from "@/lib/projects";
import type { ProjectStepStatus } from "@/lib/projects/step-types";

type Params = { params: Promise<{ id: string }> };

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

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "projects", "read");
  if (denied) return denied;

  const { id: projectId } = await params;
  const accessDenied = await assertProjectAccess(session.user.id, projectId, "read");
  if (accessDenied) return accessDenied;

  const steps = await db.projectStep.findMany({
    where: { projectId },
    orderBy: { sortOrder: "asc" },
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

  return NextResponse.json(steps.map(serializeStep));
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

  const parsed = createProjectStepSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const max = await db.projectStep.aggregate({
    where: { projectId },
    _max: { sortOrder: true },
  });
  const sortOrder = (max._max.sortOrder ?? -1) + 1;

  const step = await db.projectStep.create({
    data: {
      projectId,
      sortOrder,
      title: parsed.data.title.trim(),
      description: parsed.data.description?.trim() || null,
      status: parsed.data.status ?? "OPEN",
      clientVisible: parsed.data.clientVisible ?? false,
      createdById: session.user.id,
    },
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

  const { emitNotificationSafe } = await import("@/lib/notifications");
  emitNotificationSafe({
    type: "PROJECT_STEP_UPDATED",
    actorId: session.user.id,
    entity: { type: "project", id: projectId },
    payload: {
      projectId,
      stepTitle: step.title,
      status: step.status,
      clientVisible: step.clientVisible,
    },
  });

  revalidateProjectPaths(projectId);
  return NextResponse.json(serializeStep(step), { status: 201 });
}
