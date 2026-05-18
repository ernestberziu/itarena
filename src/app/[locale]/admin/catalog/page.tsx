import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AlertTriangle, Layers, Package } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminListToolbar,
  AdminListToolbarClear,
  AdminListToolbarSubmitButton,
} from "@/components/admin/admin-list-toolbar";
import { AdminQuickFilterChips } from "@/components/admin/admin-quick-filter-chips";
import { EmptyState } from "@/components/shared/empty-state";
import { AdminCatalogTable } from "@/components/admin/admin-catalog-table";
import type { AdminCatalogRow } from "@/components/admin/admin-catalog-types";
import { loadAdminCatalogRows } from "@/lib/admin-catalog-list";
import { ADMIN_LIST_PAGE_SIZE } from "@/lib/admin-list-pagination";
import { AdminStatCard } from "@/components/admin/users";
import { Input } from "@/components/ui/input";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";

export default async function AdminCatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/hyr");

  const { locale } = await params;
  const acl = await getCachedEffectiveAcl(session.user.id);
  if (!acl) redirect("/hyr");
  requireAdminPageRead(locale, acl, "catalog");

  const sp = await searchParams;
  const lp = locale === "sq" ? "" : `/${locale}`;
  const en = locale === "en";
  const t = (sq: string, e: string) => (en ? e : sq);
  const q = sp.q?.trim();
  /** ERP category id (LISTE.KOD), same as slug in shop URLs. */
  const categorySlug = sp.category?.trim() || undefined;

  let allProducts: AdminCatalogRow[] = [];
  let categories: Awaited<ReturnType<typeof loadAdminCatalogRows>>["categories"] = [];
  let catalogError = false;
  const filterQueryParts = new URLSearchParams();
  if (q) filterQueryParts.set("q", q);
  if (categorySlug) filterQueryParts.set("category", categorySlug);
  const filterQuery = filterQueryParts.toString();

  try {
    const loaded = await loadAdminCatalogRows({ q, categorySlug });
    allProducts = loaded.rows;
    categories = loaded.categories;
  } catch {
    catalogError = true;
  }

  const totalCount = allProducts.length;
  const initialProducts = allProducts.slice(0, ADMIN_LIST_PAGE_SIZE);

  if (catalogError) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title={t("Katalog Produktesh", "Product Catalog")}
          description={t("Burimi: Financa5", "Source: Financa5")}
        />
        <EmptyState
          icon={Package}
          title={t("Katalogu nuk është i arritshëm", "Catalog unavailable")}
          description={
            locale === "sq"
              ? "Kontrollo FINANCA5_API_URL dhe FINANCA5_API_KEY. Lokalisht: npm run dev:with-mock ose node dev-mock/financa5/server.js."
              : "Check FINANCA5_API_URL and FINANCA5_API_KEY. Locally run npm run dev:with-mock or node dev-mock/financa5/server.js."
          }
        />
      </div>
    );
  }

  const baseHref = `${lp}/admin/catalog`;
  const hasActiveFilters = Boolean(q || categorySlug);
  const lowStock = allProducts.filter((p) => p.stock <= p.lowStockAt).length;
  const inactive = allProducts.filter((p) => !p.isActive).length;

  function categoryHref(slug: string | null) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (slug) p.set("category", slug);
    const qs = p.toString();
    return qs ? `${baseHref}?${qs}` : baseHref;
  }

  const activeCategory =
    categorySlug && categories.some((c) => c.slug === categorySlug) ? categorySlug : null;

  const categoryChips = [
    { href: categoryHref(null), label: t("Të gjitha", "All"), value: null as string | null },
    ...categories.map((c) => ({
      href: categoryHref(c.slug),
      label: locale === "sq" ? c.nameSq : c.nameEn,
      value: c.slug,
    })),
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("Katalog Produktesh", "Product Catalog")}
        description={t(
          `${totalCount} produkte në këtë pamje (Financa5 + përshkrime/figura lokale)`,
          `${totalCount} products in this view (Financa5 + local descriptions/images)`
        )}
        toolbar={
          <AdminListToolbar>
            <div className="flex w-full flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
              <form method="GET" action={baseHref} className="flex w-full flex-col gap-3 lg:flex-1 lg:flex-row lg:flex-wrap lg:items-end">
                <div className="relative min-w-0 flex-1 lg:max-w-md">
                  <Input
                    name="q"
                    defaultValue={q}
                    placeholder={t("Kërko produkt, SKU…", "Search product, SKU…")}
                    className="h-10"
                    aria-label={t("Kërko", "Search")}
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:flex-initial">
                  <select
                    name="category"
                    defaultValue={categorySlug ?? ""}
                    className="h-10 min-w-[10rem] flex-1 rounded-xl border-2 border-border bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-initial"
                  >
                    <option value="">{t("Të gjitha kategoritë", "All categories")}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {locale === "sq" ? c.nameSq : c.nameEn}
                      </option>
                    ))}
                  </select>
                  <AdminListToolbarSubmitButton>{t("Kërko", "Search")}</AdminListToolbarSubmitButton>
                </div>
              </form>
              <AdminListToolbarClear
                href={baseHref}
                labelSq="Pastro filtrat"
                labelEn="Clear filters"
                locale={locale}
                visible={hasActiveFilters}
              />
            </div>
            {categories.length > 0 ? (
              <AdminQuickFilterChips
                title={t("Kategoria e shpejtë", "Quick category")}
                chips={categoryChips}
                activeValue={activeCategory}
                ariaLabel={t("Filtro sipas kategorisë", "Filter catalog by category")}
              />
            ) : null}
          </AdminListToolbar>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <AdminStatCard label={t("Produkte", "Products")} value={totalCount} icon={Package} />
        <AdminStatCard label={t("Stok i ulët", "Low stock")} value={lowStock} icon={AlertTriangle} />
        <AdminStatCard label={t("Jo aktivë", "Inactive")} value={inactive} icon={Layers} />
        <AdminStatCard label={t("Kategori (filtër)", "Categories")} value={categories.length} icon={Layers} />
      </div>

      {totalCount === 0 ? (
        <EmptyState
          icon={Package}
          className="rounded-2xl border border-border/50 bg-card/40 py-16"
          title={hasActiveFilters ? t("Nuk u gjetën produkte", "No products match") : t("Nuk ka produkte", "No products")}
          description={
            hasActiveFilters
              ? t("Provo të ndryshosh kërkimin ose kategorinë.", "Try adjusting search or category.")
              : t("Nuk u kthyen produkte nga ERP për këtë filtrim.", "ERP returned no products for this filter.")
          }
          action={hasActiveFilters ? { label: t("Pastro filtrat", "Clear filters"), href: baseHref } : undefined}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.06]">
          <AdminCatalogTable
            initialProducts={initialProducts}
            totalCount={totalCount}
            pageSize={ADMIN_LIST_PAGE_SIZE}
            locale={locale}
            filterQuery={filterQuery}
          />
        </div>
      )}
    </div>
  );
}
