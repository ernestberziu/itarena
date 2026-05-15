import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { countUnreadNotifications } from "@/lib/notification-count";
import { AdminAppShell } from "@/components/admin/admin-app-shell";

const ADMIN_ROLES = ["ADMIN", "ENGINEER", "SALES", "OPS"];

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session || !ADMIN_ROLES.includes(session.user.role)) {
    redirect(locale === "en" ? "/en/hyr" : "/hyr");
  }

  const nameParts = session.user.name?.split(" ") ?? ["A"];
  const initials = nameParts
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const unreadAdmin = await countUnreadNotifications(session.user.id);

  return (
    <AdminAppShell
      userRole={session.user.role}
      userInitials={initials}
      userName={session.user.name ?? session.user.email ?? "Admin"}
      userEmail={session.user.email ?? undefined}
      contextApp="locale"
      locale={locale === "en" ? "en" : "sq"}
      notificationCount={unreadAdmin}
    >
      {children}
    </AdminAppShell>
  );
}
