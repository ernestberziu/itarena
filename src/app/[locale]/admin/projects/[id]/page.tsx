import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";
import { hasAclLevel } from "@/lib/admin-acl/features";
import { canAccessProject, projectDetailInclude } from "@/lib/projects";
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

  const [messages, tickets] = await Promise.all([
    db.projectMessage.findMany({
      where: { projectId: id },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
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
  ]);

  const canWrite =
    hasAclLevel(acl, "projects", "write") &&
    (await canAccessProject(session.user.id, id, "write"));

  const lp = locale === "sq" ? "" : `/${locale}`;

  return (
    <ProjectWorkspace
      locale={locale}
      listPrefix={lp}
      canWrite={canWrite}
      project={{
        id: project.id,
        title: project.title,
        slug: project.slug,
        status: project.status as "ACTIVE" | "ARCHIVED",
        description: project.description,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        createdBy: project.createdBy,
        members: project.members.map((m) => ({
          id: m.id,
          access: m.access as "read" | "write" | "admin",
          user: m.user,
        })),
        clients: project.clients,
      }}
      messages={messages.map((m) => ({
        id: m.id,
        body: m.body,
        isInternal: m.isInternal,
        createdAt: m.createdAt.toISOString(),
        author: m.author,
      }))}
      tickets={tickets.map((t) => ({
        ...t,
        updatedAt: t.updatedAt.toISOString(),
      }))}
    />
  );
}
