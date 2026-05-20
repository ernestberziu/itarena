import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PortalMessagingWorkspace } from "@/components/portal/portal-messaging-workspace";

export default async function PortalMessagesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ conversation?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/hyr");

  const { locale } = await params;
  const { conversation: initialConversationId } = await searchParams;
  const portalLocale = locale === "en" ? "en" : "sq";
  const t = await getTranslations({ locale, namespace: "portal.messagesPage" });

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("title")} description={t("subtitle")} />
      <PortalMessagingWorkspace
        currentUserId={session.user.id}
        locale={portalLocale}
        initialConversationId={initialConversationId}
      />
    </div>
  );
}
