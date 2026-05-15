-- Optional working-day portion of ticket estimate (combined with estimatedHours for SLA).
ALTER TABLE "tickets" ADD COLUMN "estimatedDays" INTEGER;
