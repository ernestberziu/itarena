import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ShoppingBag, ArrowRight, Monitor, Server, Wifi,
  Printer, Shield, Headphones, Package, Truck, CreditCard, Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { shopHostLabel, shopUrl } from "@/lib/shop-url";
import { getShopUrlRequestContext } from "@/lib/shop-url-request";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "market" });
  return { title: t("title") };
}

export default async function TreguPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lp = locale === "sq" ? "" : `/${locale}`;

  const shopCtx = await getShopUrlRequestContext();
  const shopDomainLabel = shopCtx
    ? shopHostLabel(shopCtx.requestHost)
    : (() => {
        try {
          return new URL(shopUrl("", shopCtx)).hostname;
        } catch {
          return "shop";
        }
      })();

  const categories = [
    { icon: Monitor, name: locale === "sq" ? "Kompjuterë & Laptopë" : "Computers & Laptops", color: "bg-blue-50 text-blue-600 border-blue-100" },
    { icon: Server, name: locale === "sq" ? "Serverë & Storage" : "Servers & Storage", color: "bg-violet-50 text-violet-600 border-violet-100" },
    { icon: Wifi, name: locale === "sq" ? "Rrjete & Networking" : "Networks & Networking", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    { icon: Printer, name: locale === "sq" ? "Printerë & MFP" : "Printers & MFP", color: "bg-amber-50 text-amber-600 border-amber-100" },
    { icon: Shield, name: locale === "sq" ? "Siguri & CCTV" : "Security & CCTV", color: "bg-rose-50 text-rose-600 border-rose-100" },
    { icon: Headphones, name: locale === "sq" ? "Aksesorë & Periferikë" : "Accessories & Peripherals", color: "bg-teal-50 text-teal-600 border-teal-100" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-amber-300/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-orange-300/15 blur-3xl" />
        </div>

        <div className="container relative mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 border border-amber-200 px-5 py-2 text-sm font-semibold text-amber-700 mb-8">
            <ShoppingBag className="h-4 w-4" />
            IT Arena Shop — {shopDomainLabel}
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-7 leading-tight">
            {locale === "sq" ? (
              <>
                Dyqani Online i{" "}
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Hardware & Software
                </span>
              </>
            ) : (
              <>
                Online{" "}
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Hardware & Software
                </span>{" "}
                Store
              </>
            )}
          </h1>

          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            {locale === "sq"
              ? "Kompjuterë, serverë, rrjete dhe gjithçka tjetër për biznesin tuaj. Pagesa me dorëzim (COD). Bizneset B2B marrin çmime ekskluzive."
              : "Computers, servers, networks and everything else for your business. Cash on delivery. B2B businesses get exclusive prices."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              asChild
            >
              <Link href={shopUrl("", shopCtx)}>
                {locale === "sq" ? "Shko tek Dyqani" : "Go to Shop"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="rounded-xl border-2 font-semibold px-8"
            >
              <Link href={`${lp}/kerko-oferte`}>
                {locale === "sq" ? "Kërko Ofertë B2B" : "Request B2B Quote"}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Truck,
                color: "bg-blue-50 text-blue-600",
                title: locale === "sq" ? "Dorëzim në Shqipëri" : "Delivery in Albania",
                desc: locale === "sq" ? "Dërgesa në të gjithë territorin shqiptar brenda 24–48 orëve." : "Shipping throughout Albania within 24–48 hours.",
              },
              {
                icon: CreditCard,
                color: "bg-emerald-50 text-emerald-600",
                title: locale === "sq" ? "Pagesë me Dorëzim (COD)" : "Cash on Delivery (COD)",
                desc: locale === "sq" ? "Paguani vetëm kur e merrni produktin. Pa risk, pa paradhënie." : "Pay only when you receive the product. No risk, no advance payment.",
              },
              {
                icon: Building2,
                color: "bg-violet-50 text-violet-600",
                title: locale === "sq" ? "Çmime Ekskluzive B2B" : "Exclusive B2B Prices",
                desc: locale === "sq" ? "Bizneset B2B marrin çmime preferenciale dhe mund të kërkojnë ofertë sasi." : "B2B businesses get preferential prices and can request quantity quotes.",
              },
            ].map((f) => (
              <div key={f.title} className="flex gap-5 items-start">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              {locale === "sq" ? "Kategorite e Produkteve" : "Product Categories"}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {locale === "sq"
                ? "Gjeni gjithçka që biznesi juaj ka nevojë — nga workstationet deri te infrastruktura e rrjetit."
                : "Find everything your business needs — from workstations to network infrastructure."}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link key={cat.name} href={shopUrl("", shopCtx)} className="group">
                <div className={`flex items-center gap-4 rounded-2xl border p-5 bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 ${cat.color}`}>
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${cat.color}`}>
                    <cat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground leading-tight">{cat.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 group-hover:text-primary transition-colors">
                      {locale === "sq" ? "Shiko produktet →" : "View products →"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button
              size="lg"
              asChild
            >
              <Link href={shopUrl("", shopCtx)}>
                {locale === "sq" ? "Shiko Të Gjitha Produktet" : "View All Products"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* B2B section */}
      <section className="py-16 bg-[hsl(222,47%,9%)] text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/60 mb-5">
                B2B
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-5">
                {locale === "sq" ? "Jeni Biznes? Merrni Çmime Ekskluzive" : "Are You a Business? Get Exclusive Prices"}
              </h2>
              <p className="text-slate-300 leading-relaxed mb-8">
                {locale === "sq"
                  ? "Bizneset e regjistruara B2B marrin çmime preferenciale, mund të blejnë me sasi të mëdha dhe të kërkojnë ofertë të personalizuar për çdo produkt."
                  : "Registered B2B businesses get preferential prices, can buy in large quantities and request a personalized quote for each product."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  asChild
                >
                  <Link href={`${lp}/regjistrohu`}>
                    {locale === "sq" ? "Regjistrohu si Biznes" : "Register as Business"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="secondary" asChild className="rounded-xl">
                  <Link href={shopUrl("", shopCtx)}>
                    {locale === "sq" ? "Hyr dhe Bli" : "Login & Buy"}
                  </Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Package, label: locale === "sq" ? "Çmime Shumice" : "Bulk Pricing", color: "bg-blue-500/20" },
                { icon: Building2, label: locale === "sq" ? "Ofertë e Personalizuar" : "Custom Quote", color: "bg-amber-500/20" },
                { icon: Shield, label: locale === "sq" ? "Garanci Zgjatur" : "Extended Warranty", color: "bg-emerald-500/20" },
                { icon: Headphones, label: locale === "sq" ? "Mbështetje Prioritare" : "Priority Support", color: "bg-violet-500/20" },
              ].map((item) => (
                <div key={item.label} className={`rounded-2xl ${item.color} border border-white/10 p-5 text-center`}>
                  <item.icon className="h-8 w-8 text-white mx-auto mb-3" />
                  <p className="text-sm font-bold text-white">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
