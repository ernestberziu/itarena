import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { FilterBar } from "@/components/admin/filter-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { AdminCatalogTable, type AdminCatalogRow } from "@/components/admin/admin-catalog-table";
import { getFinanca5Client } from "@/lib/financa5-client";
import { adaptProducts } from "@/lib/erp-adapters";

export default async function AdminCatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await auth();
  if (!session) redirect("/hyr");

  const { locale } = await params;
  const sp = await searchParams;
  const lp = locale === "sq" ? "" : `/${locale}`;
  const q = sp.q?.trim();
  /** ERP category id (LISTE.KOD), same as slug in shop URLs. */
  const categorySlug = sp.category?.trim() || undefined;

  let products: AdminCatalogRow[] = [];
  let categories: ReturnType<typeof adaptProducts>["categories"] = [];
  let catalogError = false;

  try {
    const client = getFinanca5Client();
    const [erpProducts, erpCategories] = await Promise.all([
      client.getAllProducts(),
      client.getAllCategories(),
    ]);
    const adapted = adaptProducts(erpProducts, erpCategories, {
      categorySlug,
      search: q,
    });
    products = adapted.products.map((product) => ({
      id: product.id,
      sku: product.sku,
      nameSq: product.nameSq,
      nameEn: product.nameEn,
      brand: product.brand,
      stock: product.stock,
      lowStockAt: product.lowStockAt,
      isActive: product.isActive,
      imagesJson: JSON.stringify(product.images),
      priceRetail: String(product.priceRetail),
      priceB2b: String(product.priceB2b),
      category: { nameSq: product.category.nameSq, nameEn: product.category.nameEn },
    }));
    categories = adapted.categories;
  } catch {
    catalogError = true;
  }

  if (catalogError) {
    return (
      <div className="space-y-5">
        <AdminPageHeader
          title={locale === "sq" ? "Katalog Produktesh" : "Product Catalog"}
          description={locale === "sq" ? "Burimi: Financa5" : "Source: Financa5"}
        />
        <EmptyState
          icon={Package}
          title={locale === "sq" ? "Katalogu nuk është i arritshëm" : "Catalog unavailable"}
          description={
            locale === "sq"
              ? "Kontrollo FINANCA5_API_URL dhe FINANCA5_API_KEY. Lokalisht: npm run dev:with-mock ose node dev-mock/financa5/server.js."
              : "Check FINANCA5_API_URL and FINANCA5_API_KEY. Locally run npm run dev:with-mock or node dev-mock/financa5/server.js."
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title={locale === "sq" ? "Katalog Produktesh" : "Product Catalog"}
        description={`${products.length} ${locale === "sq" ? "produkte (Financa5)" : "products (Financa5)"}`}
        toolbar={
          <FilterBar>
            <form method="GET" action={`${lp}/admin/catalog`} className="flex flex-wrap items-center gap-2">
              <input
                name="q"
                defaultValue={q}
                placeholder={locale === "sq" ? "Kërko produkt, SKU..." : "Search product, SKU..."}
                className="h-8 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-52"
              />
              <select
                name="category"
                defaultValue={categorySlug ?? ""}
                className="h-8 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">{locale === "sq" ? "Të gjitha kategoritë" : "All categories"}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {locale === "sq" ? c.nameSq : c.nameEn}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="h-8 px-3 rounded-lg border bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
              >
                {locale === "sq" ? "Kërko" : "Search"}
              </button>
            </form>
          </FilterBar>
        }
      />

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title={locale === "sq" ? "Nuk u gjetën produkte" : "No products found"}
          description={locale === "sq" ? "Provoni të ndryshoni filtrat" : "Try adjusting your filters"}
        />
      ) : (
        <AdminCatalogTable products={products} locale={locale} />
      )}
    </div>
  );
}
