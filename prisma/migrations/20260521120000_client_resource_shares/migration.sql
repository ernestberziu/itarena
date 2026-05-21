-- CreateTable
CREATE TABLE "client_resource_shares" (
    "id" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "ticketId" TEXT,
    "projectId" TEXT,
    "clientName" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "passcodeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "lastAccessAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_resource_shares_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "ticket_comments" ALTER COLUMN "authorId" DROP NOT NULL;
ALTER TABLE "ticket_comments" ADD COLUMN "guestAuthorName" TEXT;
ALTER TABLE "ticket_comments" ADD COLUMN "publicShareId" TEXT;

-- AlterTable
ALTER TABLE "conversation_messages" ALTER COLUMN "authorId" DROP NOT NULL;
ALTER TABLE "conversation_messages" ADD COLUMN "guestAuthorName" TEXT;
ALTER TABLE "conversation_messages" ADD COLUMN "publicShareId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "client_resource_shares_token_key" ON "client_resource_shares"("token");

-- CreateIndex
CREATE INDEX "client_resource_shares_ticketId_idx" ON "client_resource_shares"("ticketId");

-- CreateIndex
CREATE INDEX "client_resource_shares_projectId_idx" ON "client_resource_shares"("projectId");

-- AddForeignKey
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_publicShareId_fkey" FOREIGN KEY ("publicShareId") REFERENCES "client_resource_shares"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_publicShareId_fkey" FOREIGN KEY ("publicShareId") REFERENCES "client_resource_shares"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "client_resource_shares" ADD CONSTRAINT "client_resource_shares_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_resource_shares" ADD CONSTRAINT "client_resource_shares_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
