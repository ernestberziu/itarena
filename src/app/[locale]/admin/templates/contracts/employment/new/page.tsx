import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageWrite } from "@/lib/admin-acl/page-guard";
import { EmploymentContractWorkspace } from "@/components/admin/templates/employment-contract-workspace";

export default async function NewEmploymentContractPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/hyr");

  const { locale } = await params;
  const acl = await getCachedEffectiveAcl(session.user.id);
  if (!acl) redirect("/hyr");
  requireAdminPageWrite(locale, acl, "templates");

  const lp = locale === "sq" ? "" : `/${locale}`;

  return <EmploymentContractWorkspace locale={locale} lp={lp} />;
}
