import Link from "next/link";
import { CheckCircle2, ShoppingBag, Truck, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mainSiteUrl, shopPath } from "@/lib/shop-url";
import { getShopLocaleServer } from "@/lib/shop-locale-server";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const locale = await getShopLocaleServer();
  const t = await getTranslations({ locale, namespace: "shop" });
  return { title: t("successTitle") };
}

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const shopLocale = await getShopLocaleServer();
  const t = await getTranslations({ locale: shopLocale, namespace: "shop" });

  const steps = [
    { icon: CheckCircle2, label: t("successStepConfirmed"), color: "bg-emerald-50 text-emerald-600", done: true },
    { icon: Truck, label: t("successStepShipping"), color: "bg-blue-50 text-blue-600", done: false },
    { icon: ShoppingBag, label: t("successStepDelivery"), color: "bg-amber-50 text-amber-600", done: false },
  ] as const;

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-lg w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 shadow-xl shadow-emerald-100">
            <CheckCircle2 className="h-14 w-14 text-emerald-600" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold mb-3">{t("successTitle")}</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          {t("successIntro", { orderNumber: `#${orderNumber}` })}
        </p>

        <div className="grid grid-cols-3 gap-4 mb-10">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`rounded-2xl border p-4 text-center ${step.done ? "border-emerald-200 bg-emerald-50" : "border-border/60 bg-white"}`}
            >
              <div className={`flex h-10 w-10 mx-auto items-center justify-center rounded-xl ${step.color} mb-2`}>
                <step.icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold leading-tight">{step.label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 mb-8 text-left">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="h-4 w-4 text-amber-600" />
            <p className="font-bold text-sm text-amber-900">{t("successCodTitle")}</p>
          </div>
          <p className="text-sm text-amber-800">{t("successCodDesc")}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="rounded-xl">
            <Link href={shopPath(shopLocale)}>{t("continue_shopping")}</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-xl">
            <Link href={mainSiteUrl(shopLocale === "en" ? "/en/portal/orders" : "/portal/orders")}>
              {t("view_orders")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
