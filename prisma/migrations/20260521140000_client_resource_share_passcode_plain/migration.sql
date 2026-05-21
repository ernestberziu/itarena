-- AlterTable
ALTER TABLE "client_resource_shares" ADD COLUMN "passcodePlain" TEXT NOT NULL DEFAULT '';

-- Existing rows: admins must regenerate passcode to get a visible code
UPDATE "client_resource_shares" SET "passcodePlain" = '' WHERE "passcodePlain" = '';

ALTER TABLE "client_resource_shares" ALTER COLUMN "passcodePlain" DROP DEFAULT;
