"use client";
import { useUiT } from "@/hooks/use-ui-t";

import Link from "next/link";
import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { CheckCircle2, ExternalLink, Package, Pencil, XCircle } from "lucide-react";
import { AdminInfiniteTable } from "@/components/admin/admin-infinite-table";
import { AdminCatalogProductEditSheet } from "@/components/admin/admin-catalog-product-edit-sheet";
import { formatPrice } from "@/lib/utils";
import { shopUrl } from "@/lib/shop-url";
import { Button } from "@/components/ui/button";
import type { AdminCatalogRow } from "@/components/admin/admin-catalog-types";
import { useInfiniteList } from "@/hooks/use-infinite-list";
import { useMobileInfiniteSentinel } from "@/hooks/use-mobile-infinite-sentinel";

export type { AdminCatalogRow } from "@/components/admin/admin-catalog-types";

export function AdminCatalogTable({
  initialProducts,
  totalCount,
  pageSize,
  locale,
  filterQuery,
}: {
  initialProducts: AdminCatalogRow[];
  totalCount: number;
  pageSize: number;
  locale: string;
  filterQuery: string;
}) {
  const [editRow, setEditRow] = useState<AdminCatalogRow | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const reduceMotion = useReducedMotion();
  const thUi = useUiT();

  const { rows, hasMore, loadingMore, error, scrollRef, sentinelRef, loadedCount, loadNext } =
    useInfiniteList({
      initialItems: initialProducts,
      totalCount,
      pageSize,
      filterQuery,
      fetchUrl: "/api/admin/catalog/products",
      getRowId: (r) => r.id,
      locale,
    });

  const mobileSentinelRef = useMobileInfiniteSentinel(loadNext);

  const columns = useMemo<ColumnDef<AdminCatalogRow>[]>(() => {
    return [
      {
        id: "product",
        accessorFn: (row) => (locale === "sq" ? row.nameSq : row.nameEn).toLowerCase(),
        header: thUi("product"),
        enableSorting: true,
        meta: {
          headerClassName: "max-w-[13rem] xl:max-w-[16rem]",
          cellClassName: "max-w-[13rem] xl:max-w-[16rem]",
        },
        cell: ({ row }) => {
          let firstImage: string | undefined;
          try {
            firstImage = JSON.parse(row.original.imagesJson)?.[0] as string | undefined;
          } catch {
            firstImage = undefined;
          }
          const title = locale === "sq" ? row.original.nameSq : row.original.nameEn;
          return (
            <div className="flex min-w-[10rem] max-w-[min(100vw,20rem)] items-center gap-3">
              {firstImage ? (
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border bg-muted">
                  <Image src={firstImage} alt={title} fill className="object-cover" sizes="36px" unoptimized />
                </div>
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-muted">
                  <Package className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{title}</p>
                {row.original.brand && (
                  <p className="truncate text-xs text-muted-foreground">{row.original.brand}</p>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "sku",
        header: "SKU",
        enableSorting: true,
        meta: {
          headerClassName:
            "min-w-[18rem] sm:min-w-[22rem] md:min-w-[28rem] lg:min-w-[32rem] xl:min-w-[36rem] w-[32%] align-top normal-case tracking-normal",
          cellClassName:
            "min-w-[18rem] sm:min-w-[22rem] md:min-w-[28rem] lg:min-w-[32rem] xl:min-w-[36rem] max-w-[min(72rem,calc(100vw-8rem))] align-top font-normal [font-variant-numeric:lining-nums]",
        },
        cell: ({ row }) => (
          <div
            className="overflow-x-auto rounded-md border border-border/50 bg-muted/25 px-2 py-2 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border"
            title={row.original.sku}
          >
            <span className="inline-block min-w-max whitespace-nowrap font-mono text-[11px] leading-normal tracking-tight text-foreground sm:text-xs">
              {row.original.sku}
            </span>
          </div>
        ),
      },
      {
        id: "category",
        accessorFn: (row) =>
          (locale === "sq" ? row.category.nameSq : row.category.nameEn).toLowerCase(),
        header: thUi("category"),
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {locale === "sq" ? row.original.category.nameSq : row.original.category.nameEn}
          </span>
        ),
      },
      {
        id: "retail",
        accessorFn: (row) => Number(row.priceRetail) || 0,
        header: thUi("retail"),
        enableSorting: true,
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">{formatPrice(Number(row.original.priceRetail))}</span>
        ),
      },
      {
        id: "b2b",
        accessorFn: (row) => Number(row.priceB2b) || 0,
        header: thUi("b2b"),
        enableSorting: true,
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">{formatPrice(Number(row.original.priceB2b))}</span>
        ),
      },
      {
        accessorKey: "stock",
        header: thUi("stock"),
        enableSorting: true,
        cell: ({ row }) => {
          const lowStock = row.original.stock <= row.original.lowStockAt;
          return (
            <span
              className={`text-sm font-semibold tabular-nums ${lowStock ? "text-red-500" : "text-foreground"}`}
            >
              {row.original.stock}
              {lowStock && <span className="ml-1 text-xs font-normal">{thUi("low")}</span>}
            </span>
          );
        },
      },
      {
        accessorKey: "isActive",
        header: thUi("active"),
        enableSorting: true,
        sortingFn: (a, b) => Number(a.original.isActive) - Number(b.original.isActive),
        cell: ({ row }) =>
          row.original.isActive ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" strokeWidth={2} />
          ) : (
            <XCircle className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
          ),
      },
      {
        id: "actions",
        header: thUi("actions"),
        enableSorting: false,
        cell: ({ row }) => {
          const href = shopUrl(`products/${encodeURIComponent(row.original.sku)}`);
          return (
            <div className="flex items-center gap-0.5">
              <Button variant="outline" size="sm" className="h-8 gap-1 px-2" asChild>
                <Link href={href} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  {thUi("view")}
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1 px-2"
                onClick={() => setEditRow(row.original)}
              >
                <Pencil className="h-3.5 w-3.5" />
                {thUi("edit")}
              </Button>
            </div>
          );
        },
      },
    ];
  }, [locale]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const emptyMessage = thUi("no_products");

  function productImage(row: AdminCatalogRow): string | undefined {
    try {
      return JSON.parse(row.imagesJson)?.[0] as string | undefined;
    } catch {
      return undefined;
    }
  }

  return (
    <>
      <div className="hidden lg:block">
        <AdminInfiniteTable
          table={table}
          locale={locale}
          labels={{
            entitySq: "produkte",
            entityEn: "products",
            emptySq: emptyMessage,
            emptyEn: emptyMessage,
          }}
          totalCount={totalCount}
          loadedCount={loadedCount}
          hasMore={hasMore}
          loadingMore={loadingMore}
          error={error}
          scrollRef={scrollRef}
          sentinelRef={sentinelRef}
          getRowId={(r) => r.id}
          minTableWidth="960px"
          firstColumnId="product"
        />
      </div>

      <div className="space-y-3 border-t border-border/60 py-3 lg:hidden">
        <p className="text-xs text-muted-foreground px-1">
          <span className="font-medium tabular-nums text-foreground">{loadedCount}</span>
          <span className="text-muted-foreground/70"> / </span>
          <span className="tabular-nums">{totalCount}</span>
        </p>
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-16 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          rows.map((row, i) => {
            const title = locale === "sq" ? row.nameSq : row.nameEn;
            const img = productImage(row);
            const lowStock = row.stock <= row.lowStockAt;
            return (
              <motion.article
                key={row.id}
                layout
                {...(!reduceMotion
                  ? { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 } }
                  : {})}
                transition={{ duration: reduceMotion ? 0 : 0.2, delay: reduceMotion ? 0 : i * 0.03 }}
                className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]"
              >
                <div className="flex gap-3">
                  {img ? (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border bg-muted">
                      <Image src={img} alt={title} fill className="object-cover" sizes="56px" unoptimized />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border bg-muted">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-snug line-clamp-2">{title}</p>
                    <p className="mt-1 font-mono text-[11px] text-muted-foreground break-all">{row.sku}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {locale === "sq" ? row.category.nameSq : row.category.nameEn}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-semibold tabular-nums">
                        {formatPrice(Number(row.priceRetail))}
                      </span>
                      <span
                        className={`text-xs font-semibold tabular-nums ${lowStock ? "text-red-500" : "text-muted-foreground"}`}
                      >
                        {thUi("stock")}: {row.stock}
                      </span>
                      {row.isActive ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" aria-hidden />
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 border-t border-border/50 pt-3">
                  <Button variant="outline" size="sm" className="flex-1 gap-1" asChild>
                    <Link
                      href={shopUrl(`products/${encodeURIComponent(row.sku)}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {thUi("view")}
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => setEditRow(row)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {thUi("edit")}
                  </Button>
                </div>
              </motion.article>
            );
          })
        )}
        {loadingMore ? (
          <p className="py-2 text-center text-xs text-muted-foreground">{thUi("loading")}</p>
        ) : null}
        {error ? <p className="text-center text-xs text-destructive">{error}</p> : null}
        <div ref={mobileSentinelRef} className="h-px w-full" aria-hidden />
      </div>

      <AdminCatalogProductEditSheet
        row={editRow}
        open={editRow !== null}
        onOpenChange={(o) => {
          if (!o) setEditRow(null);
        }}
        locale={locale}
      />
    </>
  );
}
