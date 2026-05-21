import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";
import { hasAclLevel } from "@/lib/admin-acl/features";
import { isCalendarAdmin } from "@/lib/calendar/access";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CalendarWorkspace } from "@/components/admin/calendar/calendar-workspace";

export default async function AdminCalendarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/hyr");

  const { locale } = await params;
  const acl = await getCachedEffectiveAcl(session.user.id);
  if (!acl) redirect("/hyr");
  requireAdminPageRead(locale, acl, "calendar");

  const t = await getTranslations("admin.calendarPage");
  const canWrite = hasAclLevel(acl, "calendar", "write");
  const isAdmin = isCalendarAdmin(session.user.role);

  return (
    <div className="flex min-h-[calc(100dvh-11rem)] flex-col gap-4 md:min-h-[min(70vh,640px)] md:gap-6">
      <AdminPageHeader title={t("title")} description={t("subtitle")} />
      <CalendarWorkspace
        locale={locale}
        currentUserId={session.user.id}
        isAdmin={isAdmin}
        canWrite={canWrite}
        className="flex min-h-0 min-w-0 flex-1 flex-col"
      />
    </div>
  );
}
