-- CreateTable
CREATE TABLE "document_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "bodyMarkdown" TEXT NOT NULL,
    "sectionsJson" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_documents" (
    "id" TEXT NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "language" TEXT NOT NULL DEFAULT 'sq',
    "templateId" TEXT,
    "partyJson" JSONB NOT NULL,
    "payloadJson" JSONB NOT NULL,
    "pdfUrl" TEXT,
    "pdfGeneratedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "configJson" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "template_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "document_templates_type_language_idx" ON "document_templates"("type", "language");

-- CreateIndex
CREATE UNIQUE INDEX "contract_documents_documentNumber_key" ON "contract_documents"("documentNumber");

-- CreateIndex
CREATE INDEX "contract_documents_type_status_idx" ON "contract_documents"("type", "status");

-- CreateIndex
CREATE INDEX "contract_documents_createdById_idx" ON "contract_documents"("createdById");

-- CreateIndex
CREATE INDEX "contract_documents_createdAt_idx" ON "contract_documents"("createdAt");

-- AddForeignKey
ALTER TABLE "contract_documents" ADD CONSTRAINT "contract_documents_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "document_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
