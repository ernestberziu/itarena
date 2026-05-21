import { db } from "@/lib/db";
import { ensureProjectConversation } from "@/lib/messages/project-channel";
import type { ProjectStatus } from "@/lib/projects/types";
import type { Role } from "@/types/domain";

export async function loadPublicShareProject(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      createdById: true,
      updatedAt: true,
      steps: {
        where: { clientVisible: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          sortOrder: true,
          title: true,
          description: true,
          status: true,
        },
      },
    },
  });

  if (!project) return null;

  const conv = await ensureProjectConversation(projectId, project.createdById);
  const messages = conv
    ? await db.conversationMessage.findMany({
        where: { conversationId: conv.id, isInternal: false },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          body: true,
          createdAt: true,
          guestAuthorName: true,
          author: { select: { id: true, firstName: true, lastName: true, role: true } },
        },
      })
    : [];

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    status: project.status as ProjectStatus,
    updatedAt: project.updatedAt,
    steps: project.steps,
    messages: messages.map((m) => ({
      id: m.id,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
      guestAuthorName: m.guestAuthorName,
      author: m.author
        ? { ...m.author, role: m.author.role as Role }
        : null,
    })),
  };
}
