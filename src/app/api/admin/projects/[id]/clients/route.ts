import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import {
  assertProjectAccess,
  projectClientSchema,
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

  const clients = await db.projectClient.findMany({
    where: { projectId },
    include: {
      company: { select: { id: true, name: true } },
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(clients);
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

  const parsed = projectClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const companyId = parsed.data.companyId?.trim() || null;
  const userId = parsed.data.userId?.trim() || null;

  if (companyId) {
    const company = await db.company.findUnique({ where: { id: companyId } });
    if (!company) return NextResponse.json({ error: "Company not found" }, { status: 400 });
  }
  if (userId) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 400 });
  }

  const duplicate = await db.projectClient.findFirst({
    where: {
      projectId,
      companyId: companyId ?? undefined,
      userId: userId ?? undefined,
    },
  });
  if (duplicate) return NextResponse.json(duplicate);

  const client = await db.projectClient.create({
    data: { projectId, companyId, userId },
    include: {
      company: { select: { id: true, name: true } },
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  revalidateProjectPaths(projectId);
  return NextResponse.json(client, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "projects", "write");
  if (denied) return denied;

  const { id: projectId } = await params;
  const accessDenied = await assertProjectAccess(session.user.id, projectId, "write");
  if (accessDenied) return accessDenied;

  const { searchParams } = new URL(req.url);
  const clientLinkId = searchParams.get("clientLinkId");
  if (!clientLinkId) return NextResponse.json({ error: "clientLinkId required" }, { status: 400 });

  await db.projectClient.delete({ where: { id: clientLinkId, projectId } });
  revalidateProjectPaths(projectId);
  return NextResponse.json({ ok: true });
}
