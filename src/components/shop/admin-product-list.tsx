"use client";

import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Package, AlertTriangle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { shopUrl } from "@/lib/shop-url";

interface Product {
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
}

export function AdminProductList({ products }: { products: Product[] }) {
  return (
    <div className="admin-card-elevated overflow-hidden rounded-2xl">
      <div className="max-h-[min(70vh,900px)] overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/60">
              <th className="sticky top-0 z-10 bg-muted/95 px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground shadow-[inset_0_-1px_0_0_hsl(var(--border))] backdrop-blur-md">
                Produkti
              </th>
              <th className="sticky top-0 z-10 bg-muted/95 px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground shadow-[inset_0_-1px_0_0_hsl(var(--border))] backdrop-blur-md">
                Kategoria
              </th>
              <th className="sticky top-0 z-10 bg-muted/95 px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground shadow-[inset_0_-1px_0_0_hsl(var(--border))] backdrop-blur-md">
                Çmimi Retail
              </th>
              <th className="sticky top-0 z-10 bg-muted/95 px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground shadow-[inset_0_-1px_0_0_hsl(var(--border))] backdrop-blur-md">
                Çmimi B2B
              </th>
              <th className="sticky top-0 z-10 bg-muted/95 px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground shadow-[inset_0_-1px_0_0_hsl(var(--border))] backdrop-blur-md">
                Stoku
              </th>
              <th className="sticky top-0 z-10 bg-muted/95 px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground shadow-[inset_0_-1px_0_0_hsl(var(--border))] backdrop-blur-md">
                Statusi
              </th>
              <th className="sticky top-0 z-10 bg-muted/95 px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground shadow-[inset_0_-1px_0_0_hsl(var(--border))] backdrop-blur-md">
                Dyqani
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                  <Package className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                  Nuk ka produkte të listuara nga Financa5.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const isLowStock = p.stock > 0 && p.stock <= p.lowStockAt;
                const isOutOfStock = p.stock === 0;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 rounded-xl bg-slate-100 overflow-hidden border">
                          {p.images[0] ? (
                            <Image src={p.images[0]} alt={p.nameSq} fill className="object-contain p-1" sizes="48px" />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Package className="h-5 w-5 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{p.nameSq}</p>
                          <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                          {p.brand && <p className="text-xs text-muted-foreground">{p.brand}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {p.category.nameSq}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-sm">{formatPrice(p.priceRetail)}</td>
                    <td className="px-5 py-4 text-right font-semibold text-sm text-violet-700">{formatPrice(p.priceB2b)}</td>
                    <td className="px-5 py-4 text-center">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-1 text-xs font-bold text-red-700">
                          <AlertTriangle className="h-3 w-3" />0
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-bold text-amber-700">
                          <AlertTriangle className="h-3 w-3" />
                          {p.stock}
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          {p.stock}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={
                          p.isActive
                            ? "text-xs font-semibold text-emerald-700"
                            : "text-xs font-semibold text-muted-foreground"
                        }
                      >
                        {p.isActive ? "Aktiv" : "Joaktiv"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={shopUrl(`products/${encodeURIComponent(p.id)}`)}
                        className="inline-flex items-center gap-1 rounded-lg border border-border/60 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 hover:border-primary/30 hover:text-primary transition-all"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Shiko
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
