import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";
import { hasAclLevel } from "@/lib/admin-acl/features";
import { canAccessProject, projectDetailInclude } from "@/lib/projects";
import { ensureProjectConversation } from "@/lib/messages/project-channel";
import type { ProjectListRow } from "@/lib/projects/types";
import { ProjectWorkspace } from "@/components/admin/projects/project-workspace";

export default async function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/hyr");

  const { locale, id } = await params;
  const acl = await getCachedEffectiveAcl(session.user.id);
  if (!acl) redirect("/hyr");
  requireAdminPageRead(locale, acl, "projects");

  const allowed = await canAccessProject(session.user.id, id, "read");
  if (!allowed) notFound();

  const project = await db.project.findUnique({
    where: { id },
    include: projectDetailInclude,
  });
  if (!project) notFound();

  const conv = await ensureProjectConversation(id, session.user.id);

  const [messageCount, tickets, steps] = await Promise.all([
    conv
      ? db.conversationMessage.count({ where: { conversationId: conv.id } })
      : Promise.resolve(0),
    db.ticket.findMany({
      where: { projectId: id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        number: true,
        title: true,
        status: true,
        priority: true,
        updatedAt: true,
      },
    }),
    db.projectStep.findMany({
      where: { projectId: id },
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
    }),
  ]);

  const canWrite =
    hasAclLevel(acl, "projects", "write") &&
    (await canAccessProject(session.user.id, id, "write"));

  const canMessageWrite =
    hasAclLevel(acl, "messages", "write") &&
    (await canAccessProject(session.user.id, id, "read"));

  const lp = locale === "sq" ? "" : `/${locale}`;

  return (
    <ProjectWorkspace
      locale={locale}
      listPrefix={lp}
      canWrite={canWrite}
      canMessageWrite={canMessageWrite}
      currentUserId={session.user.id}
      messageCount={messageCount}
      project={{
        id: project.id,
        title: project.title,
        slug: project.slug,
        status: project.status as ProjectListRow["status"],
        description: project.description,
        updatedAt: project.updatedAt.toISOString(),
        createdBy: project.createdBy,
        members: project.members.map((m) => ({
          id: m.id,
          access: m.access as "read" | "write" | "admin",
          user: m.user,
        })),
        clients: project.clients,
      }}
      tickets={tickets.map((t) => ({
        ...t,
        updatedAt: t.updatedAt.toISOString(),
      }))}
      steps={steps.map((s) => ({
        ...s,
        status: s.status as "OPEN" | "IN_PROGRESS" | "ON_HOLD" | "CLOSED",
        updatedAt: s.updatedAt.toISOString(),
      }))}
    />
  );
}
