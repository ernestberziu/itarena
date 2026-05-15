"use client";

import { useMemo } from "react";
import Image from "next/image";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Package, XCircle } from "lucide-react";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { formatPrice } from "@/lib/utils";

export type AdminCatalogRow = {
  id: string;
  sku: string;
  nameSq: string;
  nameEn: string;
  brand: string | null;
  stock: number;
  lowStockAt: number;
  isActive: boolean;
  imagesJson: string;
  priceRetail: number | string;
  priceB2b: number | string;
  category: { nameSq: string; nameEn: string };
};

export function AdminCatalogTable({ products, locale }: { products: AdminCatalogRow[]; locale: string }) {
  const columns = useMemo<ColumnDef<AdminCatalogRow>[]>(() => {
    const th = (sq: string, en: string) => (locale === "sq" ? sq : en);
    return [
      {
        id: "product",
        header: th("Produkti", "Product"),
        cell: ({ row }) => {
          let firstImage: string | undefined;
          try {
            firstImage = JSON.parse(row.original.imagesJson)?.[0] as string | undefined;
          } catch {
            firstImage = undefined;
          }
          const title = locale === "sq" ? row.original.nameSq : row.original.nameEn;
          return (
            <div className="flex items-center gap-3 min-w-[12rem]">
              {firstImage ? (
                <div className="h-9 w-9 rounded-lg overflow-hidden border bg-muted shrink-0 relative">
                  <Image src={firstImage} alt={title} width={36} height={36} className="object-cover h-full w-full" />
                </div>
              ) : (
                <div className="h-9 w-9 rounded-lg bg-muted border flex items-center justify-center shrink-0">
                  <Package className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                </div>
              )}
              <div>
                <p className="font-medium text-sm">{title}</p>
                {row.original.brand && <p className="text-xs text-muted-foreground">{row.original.brand}</p>}
              </div>
            </div>
          );
        },
      },
      { accessorKey: "sku", header: "SKU", cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.original.sku}</span>
      ) },
      {
        id: "category",
        header: th("Kategoria", "Category"),
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {locale === "sq" ? row.original.category.nameSq : row.original.category.nameEn}
          </span>
        ),
      },
      {
        id: "retail",
        header: th("Retail", "Retail"),
        cell: ({ row }) => <span className="font-medium tabular-nums">{formatPrice(Number(row.original.priceRetail))}</span>,
      },
      {
        id: "b2b",
        header: th("B2B", "B2B"),
        cell: ({ row }) => <span className="font-medium tabular-nums">{formatPrice(Number(row.original.priceB2b))}</span>,
      },
      {
        accessorKey: "stock",
        header: th("Stok", "Stock"),
        cell: ({ row }) => {
          const lowStock = row.original.stock <= row.original.lowStockAt;
          return (
            <span className={`text-sm font-semibold tabular-nums ${lowStock ? "text-red-500" : "text-foreground"}`}>
              {row.original.stock}
              {lowStock && <span className="ml-1 text-xs font-normal">{th("(i ulët)", "(low)")}</span>}
            </span>
          );
        },
      },
      {
        accessorKey: "isActive",
        header: th("Aktiv", "Active"),
        cell: ({ row }) =>
          row.original.isActive ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" strokeWidth={2} />
          ) : (
            <XCircle className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
          ),
      },
    ];
  }, [locale]);

  return <AdminDataTable columns={columns} data={products} pageSize={50} />;
}
