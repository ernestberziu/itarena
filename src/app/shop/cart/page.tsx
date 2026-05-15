import { CartView } from "@/components/shop/cart-view";
import { auth } from "@/lib/auth";

export const metadata = { title: "Shporta" };

export default async function CartPage() {
  const session = await auth().catch(() => null);
  const isB2b =
    session?.user?.role === "COMPANY_ADMIN" ||
    session?.user?.companyId != null;

  return <CartView isB2b={isB2b} isLoggedIn={!!session} />;
}
