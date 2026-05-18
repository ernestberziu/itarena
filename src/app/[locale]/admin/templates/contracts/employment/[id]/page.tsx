import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";
import { EmploymentContractWorkspace } from "@/components/admin/templates/employment-contract-workspace";

export default async function EditEmploymentContractPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/hyr");

  const { locale, id } = await params;
  const acl = await getCachedEffectiveAcl(session.user.id);
  if (!acl) redirect("/hyr");
  requireAdminPageRead(locale, acl, "templates");

  const lp = locale === "sq" ? "" : `/${locale}`;

  return <EmploymentContractWorkspace locale={locale} lp={lp} documentId={id} />;
}
