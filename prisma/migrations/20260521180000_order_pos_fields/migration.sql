-- AlterTable
ALTER TABLE "orders" ADD COLUMN "channel" TEXT NOT NULL DEFAULT 'WEB';
ALTER TABLE "orders" ADD COLUMN "soldById" TEXT;
ALTER TABLE "orders" ADD COLUMN "paymentMethod" TEXT;

-- CreateIndex
CREATE INDEX "orders_channel_createdAt_idx" ON "orders"("channel", "createdAt");
CREATE INDEX "orders_soldById_idx" ON "orders"("soldById");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_soldById_fkey" FOREIGN KEY ("soldById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
