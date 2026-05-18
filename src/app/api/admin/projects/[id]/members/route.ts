import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import {
  assertProjectAccess,
  canManageProjectMembers,
  isAdminUser,
  projectMemberSchema,
  updateProjectMemberSchema,
  revalidateProjectPaths,
} from "@/lib/projects";
import { STAFF_ROLES } from "@/types/domain";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "projects", "read");
  if (denied) return denied;

  const { id: projectId } = await params;
  const accessDenied = await assertProjectAccess(session.user.id, projectId, "read");
  if (accessDenied) return accessDenied;

  const members = await db.projectMember.findMany({
    where: { projectId },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(members);
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "projects", "write");
  if (denied) return denied;

  const { id: projectId } = await params;
  const canManage = await canManageProjectMembers(session.user.id, projectId);
  if (!canManage && !(await isAdminUser(session.user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = projectMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, role: true, isActive: true },
  });
  if (!user?.isActive || !STAFF_ROLES.includes(user.role as (typeof STAFF_ROLES)[number])) {
    return NextResponse.json({ error: "Invalid staff user" }, { status: 400 });
  }

  const member = await db.projectMember.upsert({
    where: { projectId_userId: { projectId, userId: parsed.data.userId } },
    update: { access: parsed.data.access },
    create: {
      projectId,
      userId: parsed.data.userId,
      access: parsed.data.access,
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
    },
  });

  revalidateProjectPaths(projectId);
  return NextResponse.json(member, { status: 201 });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "projects", "write");
  if (denied) return denied;

  const { id: projectId } = await params;
  const canManage = await canManageProjectMembers(session.user.id, projectId);
  if (!canManage && !(await isAdminUser(session.user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get("memberId");
  if (!memberId) return NextResponse.json({ error: "memberId required" }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateProjectMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const member = await db.projectMember.update({
    where: { id: memberId, projectId },
    data: { access: parsed.data.access },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
    },
  });

  revalidateProjectPaths(projectId);
  return NextResponse.json(member);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "projects", "write");
  if (denied) return denied;

  const { id: projectId } = await params;
  const canManage = await canManageProjectMembers(session.user.id, projectId);
  if (!canManage && !(await isAdminUser(session.user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get("memberId");
  if (!memberId) return NextResponse.json({ error: "memberId required" }, { status: 400 });

  await db.projectMember.delete({ where: { id: memberId, projectId } });
  revalidateProjectPaths(projectId);
  return NextResponse.json({ ok: true });
}
