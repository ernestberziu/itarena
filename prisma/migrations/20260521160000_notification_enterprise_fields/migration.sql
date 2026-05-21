-- AlterTable
ALTER TABLE "notifications" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'SYSTEM';
ALTER TABLE "notifications" ADD COLUMN "severity" TEXT NOT NULL DEFAULT 'info';
ALTER TABLE "notifications" ADD COLUMN "entityType" TEXT;
ALTER TABLE "notifications" ADD COLUMN "entityId" TEXT;
ALTER TABLE "notifications" ADD COLUMN "actorId" TEXT;
ALTER TABLE "notifications" ADD COLUMN "metadata" JSONB;
ALTER TABLE "notifications" ADD COLUMN "dedupeKey" TEXT;

-- CreateIndex
CREATE INDEX "notifications_userId_readAt_createdAt_idx" ON "notifications"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_category_idx" ON "notifications"("userId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_userId_dedupeKey_key" ON "notifications"("userId", "dedupeKey");
