/** Admin catalog grid row — Financa5 fields + overlay fields for editing. */
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
  /** Raw Prisma overlay descriptions (null = not set; merged display may still show ERP name). */
  overlayDescriptionSq: string | null;
  overlayDescriptionEn: string | null;
};
