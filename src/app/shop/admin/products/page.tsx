import { AdminProductList } from "@/components/shop/admin-product-list";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getFinanca5Client } from "@/lib/financa5-client";
import { adaptProducts } from "@/lib/erp-adapters";
import { Package } from "lucide-react";

export const metadata = { title: "Admin — Produktet" };

export default async function AdminProductsPage() {
  let products: {
    id: string;
    nameSq: string;
    nameEn: string;
    sku: string;
    priceRetail: number;
    priceB2b: number;
    stock: number;
    lowStockAt: number;
    images: string[];
    isActive: boolean;
    isFeatured: boolean;
    brand?: string | null;
    category: { nameSq: string };
  }[] = [];
  let error = false;

  try {
    const client = getFinanca5Client();
    const [erpProducts, erpCategories] = await Promise.all([
      client.getAllProducts(),
      client.getAllCategories(),
    ]);
    const { products: adapted } = adaptProducts(erpProducts, erpCategories);
    products = adapted.map((p) => ({
      id: p.id,
      nameSq: p.nameSq,
      nameEn: p.nameEn,
      sku: p.sku,
      priceRetail: p.priceRetail,
      priceB2b: p.priceB2b,
      stock: p.stock,
      lowStockAt: p.lowStockAt,
      images: p.images,
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      brand: p.brand,
      category: { nameSq: p.category.nameSq },
    }));
  } catch {
    error = true;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Menaxho Produktet"
        description={
          error
            ? "Katalogu vjen nga Financa5Api — nuk u arrit. Kontrollo FINANCA5_* ose përdor dev:with-mock."
            : `${products.length} produkte (vetëm lexim — ndryshimet bëhen në ERP)`
        }
      />
      {error ? (
        <div className="admin-card-elevated rounded-2xl p-8 flex flex-col items-center text-center gap-3 text-muted-foreground">
          <Package className="h-10 w-10 text-slate-200" />
          <p className="text-sm">Financa5Api nuk u ngarkua. Rifresko pasi të jetë e disponueshme.</p>
        </div>
      ) : (
        <AdminProductList products={products} />
      )}
    </div>
  );
}
