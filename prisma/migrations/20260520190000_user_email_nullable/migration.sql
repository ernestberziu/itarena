-- AlterTable: allow portal clients without email until invited
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;
