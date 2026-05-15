import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSettingsTabs } from "@/components/admin/admin-settings-tabs";

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/hyr");

  const { locale } = await params;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={locale === "sq" ? "Cilësimet" : "Settings"}
        description={locale === "sq" ? "Konfiguroni platformën" : "Configure the platform"}
      />

      <AdminSettingsTabs locale={locale} />
    </div>
  );
}
