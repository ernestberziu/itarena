"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "@/components/shop/cart-context";
import { ShopNavbar } from "@/components/shop/shop-navbar";
import { ShopFooter } from "@/components/shop/shop-footer";
import { Toaster } from "@/components/ui/sonner";
import { isStaff } from "@/types/domain";
import type { Session } from "next-auth";
import { getShopLocaleFromPathname } from "@/lib/shop-url";
import { sessionDisplayName } from "@/lib/session-display-name";

export function ShopLayoutChrome({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const pathname = usePathname() ?? "";
  const lang = getShopLocaleFromPathname(pathname);
  const isShopAdmin =
    pathname.includes("/admin/") || pathname.startsWith("/shop/admin");
  const isLoggedIn = !!session;
  const isB2b =
    session?.user?.role === "COMPANY_ADMIN" ||
    session?.user?.companyId != null;
  const mainDashboardPath =
    session?.user && isStaff(session.user.role)
      ? "admin"
      : "portal/dashboard";

  if (isShopAdmin) {
    return (
      <CartProvider>
        <>
          {children}
          <Toaster position="top-right" richColors />
        </>
      </CartProvider>
    );
  }

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <ShopNavbar
          lang={lang}
          isLoggedIn={isLoggedIn}
          isB2b={isB2b}
          mainDashboardPath={mainDashboardPath}
          userDisplayName={
            session?.user ? sessionDisplayName(session.user) : null
          }
        />
        <main className="flex-1">{children}</main>
        <ShopFooter lang={lang} />
      </div>
      <Toaster position="top-right" richColors />
    </CartProvider>
  );
}
