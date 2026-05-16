import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStaffNewForm } from "@/components/admin/users/admin-staff-new-form";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageWrite } from "@/lib/admin-acl/page-guard";

export default async function AdminStaffNewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/hyr");

  const { locale } = await params;
  const acl = await getCachedEffectiveAcl(session.user.id);
  if (!acl) redirect("/hyr");
  requireAdminPageWrite(locale, acl, "staff");

  if (session.user.role !== "ADMIN") {
    const lp = locale === "en" ? "/en" : "";
    redirect(`${lp}/admin/staff`);
  }

  const lp = locale === "sq" ? "" : `/${locale}`;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={locale === "sq" ? "Staf i ri" : "New staff"}
        description={
          locale === "sq"
            ? "Krijo një llogari stafi me email dhe fjalëkalim."
            : "Create a staff account with email and password."
        }
        actions={
          <Link
            href={`${lp}/admin/staff`}
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {locale === "sq" ? "← Kthehu te stafi" : "← Back to staff"}
          </Link>
        }
      />
      <AdminStaffNewForm locale={locale} />
    </div>
  );
}
