import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PortalSettingsForm } from "@/components/portal/settings-form";

export default async function PortalSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/hyr");

  const { locale } = await params;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      language: true,
    },
  });

  if (!user) redirect("/hyr");

  return (
    <div className="space-y-5">
      <PageHeader
        title={locale === "sq" ? "Cilësimet e Llogarisë" : "Account Settings"}
        description={locale === "sq" ? "Menaxhoni informacionin tuaj personal" : "Manage your personal information"}
      />
      <PortalSettingsForm user={user} locale={locale} />
    </div>
  );
}
