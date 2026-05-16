import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";
import { ReportsDashboard } from "@/components/admin/reports/reports-dashboard";

export default async function AdminReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/hyr");

  const { locale } = await params;
  const acl = await getCachedEffectiveAcl(session.user.id);
  if (!acl) redirect("/hyr");
  requireAdminPageRead(locale, acl, "reports");

  const lp = locale === "sq" ? "" : `/${locale}`;

  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted/30" />}>
      <ReportsDashboard locale={locale} lp={lp} />
    </Suspense>
  );
}
