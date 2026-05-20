import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PortalProjectStepsTimeline } from "@/components/portal/portal-project-steps";
import { PortalProjectMessages } from "@/components/portal/portal-project-messages";
import { portalUser } from "@/lib/portal/access";
import { assertPortalProjectAccess } from "@/lib/portal/project-access";
import { ensureProjectConversation } from "@/lib/messages/project-channel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { projectStatusLabel } from "@/lib/projects/status-ui";
import type { ProjectStatus } from "@/lib/projects/types";

export default async function PortalProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/hyr");

  const { locale, id } = await params;
  const lp = locale === "sq" ? "" : `/${locale}`;
  const t = await getTranslations("portal");
  const user = portalUser(session);

  const allowed = await assertPortalProjectAccess(user, id);
  if (!allowed) notFound();

  const project = await db.project.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      updatedAt: true,
      steps: {
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

  if (!project) notFound();

  const conv = await ensureProjectConversation(id, session.user.id);
  const messages = conv
    ? await db.conversationMessage.findMany({
        where: { conversationId: conv.id, isInternal: false },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          body: true,
          createdAt: true,
          author: { select: { firstName: true, lastName: true, role: true } },
        },
      })
    : [];

  const messageRows = messages.map((m) => ({
    id: m.id,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
    author: m.author,
  }));

  return (
    <div className="space-y-6">
      <Link
        href={`${lp}/portal/projects`}
        className="inline-flex text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {locale === "sq" ? "← Projektet" : "← Projects"}
      </Link>

      <AdminPageHeader
        title={project.title}
        description={project.description ?? undefined}
        actions={
          <Badge variant="secondary">
            {projectStatusLabel(project.status as ProjectStatus, locale)}
          </Badge>
        }
      />

      <Card className="admin-card-elevated">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-sm font-semibold">{t("project_steps")}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {project.steps.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("project_no_steps")}</p>
          ) : (
            <PortalProjectStepsTimeline steps={project.steps} locale={locale} />
          )}
        </CardContent>
      </Card>

      <Card className="admin-card-elevated overflow-hidden">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-sm font-semibold">
            {locale === "sq" ? "Mesazhet" : "Messages"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <PortalProjectMessages
            projectId={project.id}
            locale={locale}
            initialMessages={messageRows}
            currentUserId={session.user.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
