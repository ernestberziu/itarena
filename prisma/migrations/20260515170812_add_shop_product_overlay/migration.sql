-- CreateTable
CREATE TABLE "shop_product_overlays" (
    "erpKod" TEXT NOT NULL,
    "imagesJson" TEXT NOT NULL DEFAULT '[]',
    "descriptionSq" TEXT,
    "descriptionEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_product_overlays_pkey" PRIMARY KEY ("erpKod")
);
