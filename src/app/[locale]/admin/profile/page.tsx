import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";
import { hasAclLevel } from "@/lib/admin-acl/features";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStaffProfileAccountSection } from "@/components/admin/admin-staff-profile-account-section";

export default async function AdminProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/hyr");

  const { locale } = await params;
  const acl = await getCachedEffectiveAcl(session.user.id);
  if (!acl) redirect("/hyr");
  requireAdminPageRead(locale, acl, "profile");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      language: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  if (!user) redirect("/hyr");

  const t = await getTranslations("admin");
  const en = locale === "en";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title={t("myWorkspace")}
        description={
          en
            ? "Your account details and security settings."
            : "Të dhënat e llogarisë dhe cilësimet e sigurisë."
        }
      />
      <AdminStaffProfileAccountSection
        user={user}
        locale={locale}
        canEdit={hasAclLevel(acl, "profile", "write")}
        labels={{
          account: t("profileDashboard.account"),
          accountHint: t("profileDashboard.accountHint"),
          password: t("profileDashboard.password"),
          passwordHint: t("profileDashboard.passwordHint"),
          currentPassword: t("profileDashboard.currentPassword"),
          newPassword: t("profileDashboard.newPassword"),
          confirmPassword: t("profileDashboard.confirmPassword"),
          savePassword: t("profileDashboard.savePassword"),
          saveProfile: t("profileDashboard.saveProfile"),
          readOnlyHint: t("profileDashboard.readOnlyHint"),
        }}
      />
    </div>
  );
}
