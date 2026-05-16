import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";

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

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={locale === "sq" ? "Profili" : "Profile"}
        description={locale === "sq" ? "Të dhënat e llogarisë tuaj" : "Your account details"}
      />

      <Card>
        <CardContent className="space-y-4 p-6 text-sm">
          <div className="grid gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {locale === "sq" ? "Emri" : "Name"}
            </span>
            <span className="font-medium">
              {user.firstName} {user.lastName}
            </span>
          </div>
          <div className="grid gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</span>
            <span>{user.email}</span>
          </div>
          {user.phone && (
            <div className="grid gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {locale === "sq" ? "Telefon" : "Phone"}
              </span>
              <span>{user.phone}</span>
            </div>
          )}
          <div className="grid gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {locale === "sq" ? "Roli" : "Role"}
            </span>
            <span className="font-mono text-xs">{user.role}</span>
          </div>
          <div className="grid gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {locale === "sq" ? "Gjuha" : "Language"}
            </span>
            <span>{user.language}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
