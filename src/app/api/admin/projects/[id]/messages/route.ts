import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import {
  assertProjectAccess,
  projectMessageSchema,
  revalidateProjectPaths,
} from "@/lib/projects";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "projects", "read");
  if (denied) return denied;

  const { id: projectId } = await params;
  const accessDenied = await assertProjectAccess(session.user.id, projectId, "read");
  if (accessDenied) return accessDenied;

  const messages = await db.projectMessage.findMany({
    where: { projectId },
    include: {
      author: { select: { id: true, firstName: true, lastName: true, role: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
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

  const message = await db.projectMessage.create({
    data: {
      projectId,
      authorId: session.user.id,
      body: parsed.data.body.trim(),
      isInternal: parsed.data.isInternal ?? false,
    },
    include: {
      author: { select: { id: true, firstName: true, lastName: true, role: true } },
    },
  });

  await db.project.update({
    where: { id: projectId },
    data: { updatedAt: new Date() },
  });

  revalidateProjectPaths(projectId);
  return NextResponse.json(message, { status: 201 });
}
