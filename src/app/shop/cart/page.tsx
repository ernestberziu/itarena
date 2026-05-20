import { CartView, type ShopCheckoutPrefill } from "@/components/shop/cart-view";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PORTAL_ROLES } from "@/lib/portal/access";

export const metadata = { title: "Shporta" };

export default async function CartPage() {
  const session = await auth().catch(() => null);
  const isB2b =
    session?.user?.role === "COMPANY_ADMIN" ||
    session?.user?.companyId != null;

  let checkoutPrefill: ShopCheckoutPrefill | null = null;
  let fieldsLocked = false;

  if (
    session?.user?.id &&
    PORTAL_ROLES.includes(session.user.role as (typeof PORTAL_ROLES)[number])
  ) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        firstName: true,
        lastName: true,
        phone: true,
        company: { select: { address: true, city: true } },
      },
    });
    if (user) {
      checkoutPrefill = {
        name: `${user.firstName} ${user.lastName}`.trim(),
        phone: user.phone ?? "",
        address: user.company?.address ?? "",
        city: user.company?.city ?? "",
      };
      fieldsLocked = true;
    }
  }

  return (
    <CartView
      isB2b={isB2b}
      isLoggedIn={!!session}
      checkoutPrefill={checkoutPrefill}
      fieldsLocked={fieldsLocked}
    />
  );
}
