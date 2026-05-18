import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import {
  createProjectSchema,
  slugifyTitle,
  projectsListWhere,
  projectListInclude,
  revalidateProjectPaths,
} from "@/lib/projects";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "projects", "read");
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const where = await projectsListWhere(session.user.id, {
    q: searchParams.get("q"),
    status: searchParams.get("status"),
  });

  const projects = await db.project.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }],
    include: projectListInclude,
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "projects", "write");
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  let slug = slugifyTitle(parsed.data.title);
  const existing = await db.project.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const project = await db.project.create({
    data: {
      title: parsed.data.title.trim(),
      slug,
      description: parsed.data.description?.trim() || null,
      status: parsed.data.status ?? "ACTIVE",
      createdById: session.user.id,
      members: {
        create: {
          userId: session.user.id,
          access: "admin",
        },
      },
    },
    include: projectListInclude,
  });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "project.created",
      resource: "project",
      resourceId: project.id,
    },
  });

  revalidateProjectPaths(project.id);
  return NextResponse.json(project, { status: 201 });
}
