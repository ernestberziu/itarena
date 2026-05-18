import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";
import { hasAclLevel } from "@/lib/admin-acl/features";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MessagingWorkspace } from "@/components/admin/messages/messaging-workspace";

export default async function AdminMessagesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ conversation?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/hyr");

  const { locale } = await params;
  const { conversation: initialConversationId } = await searchParams;
  const acl = await getCachedEffectiveAcl(session.user.id);
  if (!acl) redirect("/hyr");
  requireAdminPageRead(locale, acl, "messages");

  const t = await getTranslations("admin.messagesPage");
  const canWrite = hasAclLevel(acl, "messages", "write");

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("title")} description={t("subtitle")} />
      <MessagingWorkspace
        currentUserId={session.user.id}
        canWrite={canWrite}
        initialConversationId={initialConversationId}
        className="h-[calc(100vh-12rem)] min-h-[480px]"
      />
    </div>
  );
}
