import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import {
  assertProjectAccess,
  projectClientInputSchema,
  revalidateProjectPaths,
} from "@/lib/projects";
import { linkProjectClient } from "@/lib/projects/client-link";

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

  const parsed = projectClientInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const locale = session.user.language === "en" ? "en" : "sq";

  try {
    const client = await linkProjectClient(projectId, parsed.data, { locale });
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { title: true },
    });
    const { emitNotificationSafe } = await import("@/lib/notifications");
    if (client.userId) {
      emitNotificationSafe({
        type: "PROJECT_CLIENT_LINKED",
        actorId: session.user.id,
        entity: { type: "project", id: projectId },
        payload: {
          projectId,
          title: project?.title,
          userId: client.userId,
        },
      });
    }
    revalidateProjectPaths(projectId);
    return NextResponse.json(client, { status: 201 });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "EMAIL_EXISTS") {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      }
      if (err.message === "COMPANY_NOT_FOUND" || err.message === "USER_NOT_FOUND") {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
    }
    throw err;
  }
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
