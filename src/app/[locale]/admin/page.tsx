import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { resolveStaffHomeHref } from "@/lib/admin-acl/staff-home";

const ADMIN_ROLES = ["ADMIN", "ENGINEER", "SALES", "OPS", "PARTNER"];

export default async function AdminIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;

  if (!session?.user?.id || !ADMIN_ROLES.includes(session.user.role)) {
    redirect(locale === "en" ? "/en/hyr" : "/hyr");
  }

  const acl = await getCachedEffectiveAcl(session.user.id);
  if (!acl) redirect(locale === "en" ? "/en/hyr" : "/hyr");

  redirect(resolveStaffHomeHref(locale, acl));
}
