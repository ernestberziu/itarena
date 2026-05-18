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
import { linkProjectClient } from "@/lib/projects/client-link";
import { ensureProjectConversation } from "@/lib/messages/project-channel";
import type { ProjectListRow } from "@/lib/projects/types";
import { paginatedResponse, parseListPageParams } from "@/lib/admin-list-pagination";
import { STAFF_ROLES } from "@/types/domain";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "projects", "read");
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const { page, pageSize, skip } = parseListPageParams(searchParams);
  const where = await projectsListWhere(session.user.id, {
    q: searchParams.get("q"),
    status: searchParams.get("status"),
  });

  const [projects, total] = await Promise.all([
    db.project.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      include: projectListInclude,
      skip,
      take: pageSize,
    }),
    db.project.count({ where }),
  ]);

  const items: ProjectListRow[] = projects.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    status: p.status as ProjectListRow["status"],
    description: p.description,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    createdBy: p.createdBy,
    _count: p._count,
  }));

  return NextResponse.json(paginatedResponse(items, total, page, pageSize));
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

  const extraMembers = parsed.data.members ?? [];
  const clients = parsed.data.clients ?? [];

  const project = await db.$transaction(async (tx) => {
    const created = await tx.project.create({
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
    });

    for (const m of extraMembers) {
      if (m.userId === session.user.id) continue;
      const user = await tx.user.findUnique({
        where: { id: m.userId },
        select: { id: true, role: true, isActive: true },
      });
      if (!user?.isActive || !STAFF_ROLES.includes(user.role as (typeof STAFF_ROLES)[number])) {
        continue;
      }
      await tx.projectMember.upsert({
        where: { projectId_userId: { projectId: created.id, userId: m.userId } },
        update: { access: m.access },
        create: { projectId: created.id, userId: m.userId, access: m.access },
      });
    }

    return tx.project.findUniqueOrThrow({
      where: { id: created.id },
      include: projectListInclude,
    });
  });

  const locale = session.user.language === "en" ? "en" : "sq";
  for (const c of clients) {
    try {
      await linkProjectClient(project.id, c, { locale });
    } catch {
      // Skip invalid or duplicate client links during batch create
    }
  }

  await ensureProjectConversation(project.id, session.user.id);

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
