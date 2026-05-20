-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "registeredCompanyId" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "registrationCompanySnapshot" JSONB;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "users" ADD CONSTRAINT "users_registeredCompanyId_fkey" FOREIGN KEY ("registeredCompanyId") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "companies_name_idx" ON "companies"("name");
CREATE INDEX IF NOT EXISTS "companies_vatNumber_idx" ON "companies"("vatNumber");

-- Backfill: preserve self-registered company link for existing business users
UPDATE "users"
SET "registeredCompanyId" = "companyId"
WHERE "role" = 'COMPANY_ADMIN'
  AND "companyId" IS NOT NULL
  AND "registeredCompanyId" IS NULL;
