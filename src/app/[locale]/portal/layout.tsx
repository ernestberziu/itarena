import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PortalAppShell } from "@/components/portal/portal-app-shell";
import { NotificationCountProvider } from "@/components/providers/notification-count-provider";
import { requirePortalUser, portalUser } from "@/lib/portal/access";
import { portalNotificationWhere } from "@/lib/portal/scope";
import { userHasProjectLinks } from "@/lib/portal/project-access";

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = requirePortalUser(await auth(), locale);

  const user = portalUser(session);
  const hasProjectLinks = await userHasProjectLinks(user);

  const unread = await db.notification.count({
    where: { ...portalNotificationWhere(session.user.id), readAt: null },
  });

  const nameParts = session.user.name?.split(" ") ?? ["U"];
  const initials = nameParts
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const portalLocale = locale === "en" ? "en" : "sq";

  return (
    <NotificationCountProvider initialCount={unread}>
      <PortalAppShell
        userRole={user.role}
        userInitials={initials}
        userName={session.user.name ?? session.user.email ?? "User"}
        userEmail={session.user.email ?? undefined}
        locale={portalLocale}
        notificationCount={unread}
        navContext={{
          role: user.role,
          hasProjectLinks,
          hasCompanyId: Boolean(user.companyId),
        }}
      >
        {children}
      </PortalAppShell>
    </NotificationCountProvider>
  );
}
