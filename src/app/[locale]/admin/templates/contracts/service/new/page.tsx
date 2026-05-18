import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageWrite } from "@/lib/admin-acl/page-guard";
import { ServiceContractWorkspace } from "@/components/admin/templates/service-contract-workspace";

export default async function NewServiceContractPage({
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

  return <ServiceContractWorkspace locale={locale} lp={lp} />;
}
