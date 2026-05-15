import Link from "next/link";
import { CheckCircle2, ShoppingBag, Truck, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mainSiteUrl, shopUrl } from "@/lib/shop-url";

export const metadata = { title: "Porosia u konfirmua!" };

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-lg w-full text-center">
        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 shadow-xl shadow-emerald-100">
            <CheckCircle2 className="h-14 w-14 text-emerald-600" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold mb-3">Porosia u Konfirmua!</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Porosia juaj{" "}
          <strong className="text-foreground font-mono">#{orderNumber}</strong>{" "}
          u pranua me sukses. Ekipi ynë do t&apos;ju kontaktojë për të konfirmuar dorëzimin.
        </p>

        {/* Steps */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: CheckCircle2, label: "Porosia Konfirmuar", color: "bg-emerald-50 text-emerald-600", done: true },
            { icon: Truck, label: "Dërgim 24–48h", color: "bg-blue-50 text-blue-600", done: false },
            { icon: ShoppingBag, label: "Dorëzim & COD", color: "bg-amber-50 text-amber-600", done: false },
          ].map((step, i) => (
            <div key={i} className={`rounded-2xl border p-4 text-center ${step.done ? "border-emerald-200 bg-emerald-50" : "border-border/60 bg-white"}`}>
              <div className={`flex h-10 w-10 mx-auto items-center justify-center rounded-xl ${step.color} mb-2`}>
                <step.icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold leading-tight">{step.label}</p>
            </div>
          ))}
        </div>

        {/* Notice */}
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 mb-8 text-left">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="h-4 w-4 text-amber-600" />
            <p className="font-bold text-sm text-amber-900">Pagesa me Dorëzim (COD)</p>
          </div>
          <p className="text-sm text-amber-800">
            Paguani vetëm kur të merrni produktin. Ekipi ynë do t&apos;ju telefonojë para dorëzimit
            për të konfirmuar detajet.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
          >
            <Link href={shopUrl()}>Vazhdo me Blerjet</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={mainSiteUrl("portal/orders")}>Shiko Porositë e Mia</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
