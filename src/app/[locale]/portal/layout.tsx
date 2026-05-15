import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PortalSidebar } from "@/components/portal/sidebar";
import { db } from "@/lib/db";

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session) {
    redirect(locale === "en" ? "/en/hyr" : "/hyr");
  }

  const unread = await db.notification.count({
    where: { userId: session.user.id, readAt: null },
  });

  const nameParts = session.user.name?.split(" ") ?? ["U"];
  const initials = nameParts
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden">
      <PortalSidebar
        userRole={session.user.role}
        userInitials={initials}
        userName={session.user.name ?? session.user.email ?? "User"}
        unreadNotifications={unread}
      />
      <main className="flex-1 overflow-y-auto bg-muted/20 md:pt-0 pt-14">
        <div className="container mx-auto px-4 py-6 max-w-6xl md:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
