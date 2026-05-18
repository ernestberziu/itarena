-- Bilingual saved template bodies (SQ + EN in one row)
ALTER TABLE "document_templates" ADD COLUMN IF NOT EXISTS "bodyMarkdownSq" TEXT;
ALTER TABLE "document_templates" ADD COLUMN IF NOT EXISTS "bodyMarkdownEn" TEXT;
ALTER TABLE "document_templates" ADD COLUMN IF NOT EXISTS "defaultLanguage" TEXT NOT NULL DEFAULT 'sq';

UPDATE "document_templates"
SET
  "bodyMarkdownSq" = CASE WHEN "language" = 'sq' THEN "bodyMarkdown" ELSE COALESCE("bodyMarkdownSq", '') END,
  "bodyMarkdownEn" = CASE WHEN "language" = 'en' THEN "bodyMarkdown" ELSE COALESCE("bodyMarkdownEn", '') END
WHERE "bodyMarkdownSq" IS NULL OR "bodyMarkdownEn" IS NULL;

UPDATE "document_templates"
SET "bodyMarkdownSq" = "bodyMarkdown"
WHERE ("bodyMarkdownSq" IS NULL OR "bodyMarkdownSq" = '') AND "language" = 'sq';

UPDATE "document_templates"
SET "bodyMarkdownEn" = "bodyMarkdown"
WHERE ("bodyMarkdownEn" IS NULL OR "bodyMarkdownEn" = '') AND "language" = 'en';

ALTER TABLE "document_templates" ALTER COLUMN "bodyMarkdownSq" SET NOT NULL;
ALTER TABLE "document_templates" ALTER COLUMN "bodyMarkdownEn" SET NOT NULL;
