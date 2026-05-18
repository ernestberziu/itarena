import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { createInvitedPortalClient } from "@/lib/invite-portal-client";
import type { ProjectClientInput } from "@/lib/projects/schemas";

export type ProjectClientLinkResult = {
  id: string;
  projectId: string;
  companyId: string | null;
  userId: string | null;
  label: string | null;
  company: { id: string; name: string } | null;
  user: { id: string; firstName: string; lastName: string; email: string } | null;
  invite?: { emailSent: boolean; tempPassword?: string };
};

const clientInclude = {
  company: { select: { id: true, name: true } },
  user: { select: { id: true, firstName: true, lastName: true, email: true } },
} as const;

export async function linkProjectClient(
  projectId: string,
  input: ProjectClientInput,
  options: { locale: "sq" | "en"; actorLanguage?: string }
): Promise<ProjectClientLinkResult> {
  let companyId: string | null = input.companyId?.trim() || null;
  let userId: string | null = input.userId?.trim() || null;
  let label: string | null = input.label?.trim() || null;
  let inviteMeta: ProjectClientLinkResult["invite"];

  if (input.invite) {
    const invited = await createInvitedPortalClient({
      email: input.invite.email,
      firstName: input.invite.firstName,
      lastName: input.invite.lastName,
      locale: options.locale,
    });
    userId = invited.userId;
    label = null;
    companyId = null;
    inviteMeta = invited.invite.emailSent
      ? { emailSent: true }
      : { emailSent: false, tempPassword: invited.invite.tempPassword };
  }

  if (companyId) {
    const company = await db.company.findUnique({ where: { id: companyId } });
    if (!company) throw new Error("COMPANY_NOT_FOUND");
  }
  if (userId) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("USER_NOT_FOUND");
  }

  const where: Prisma.ProjectClientWhereInput = { projectId };
  if (companyId) where.companyId = companyId;
  else if (userId) where.userId = userId;
  else if (label) where.label = label;

  const duplicate = await db.projectClient.findFirst({ where });
  if (duplicate) {
    const existing = await db.projectClient.findUnique({
      where: { id: duplicate.id },
      include: clientInclude,
    });
    if (existing) return { ...existing, invite: inviteMeta };
  }

  const client = await db.projectClient.create({
    data: { projectId, companyId, userId, label },
    include: clientInclude,
  });

  return { ...client, invite: inviteMeta };
}
