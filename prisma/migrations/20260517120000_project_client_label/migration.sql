-- Free-text client label for non-portal contacts linked to a project
ALTER TABLE "project_clients" ADD COLUMN IF NOT EXISTS "label" TEXT;
