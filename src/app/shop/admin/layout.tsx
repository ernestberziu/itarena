import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { NextIntlClientProvider } from "next-intl";
import { AdminAppShell } from "@/components/admin/admin-app-shell";
import { shopUrl } from "@/lib/shop-url";
import sqMessages from "../../../../messages/sq.json";

export default async function ShopAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth().catch(() => null);
  if (!session || !["ADMIN", "OPS"].includes(session.user.role)) {
    redirect(shopUrl());
  }

  const nameParts = session.user.name?.split(" ") ?? ["A"];
  const initials = nameParts
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <NextIntlClientProvider locale="sq" messages={sqMessages}>
      <AdminAppShell
        userRole={session.user.role}
        userInitials={initials}
        userName={session.user.name ?? session.user.email ?? "Admin"}
        userEmail={session.user.email ?? undefined}
        contextApp="shop"
        locale="sq"
      >
        {children}
      </AdminAppShell>
    </NextIntlClientProvider>
  );
}
