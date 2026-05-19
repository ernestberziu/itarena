-- CreateTable
CREATE TABLE "staff_daily_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reportDate" DATE NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_daily_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_daily_report_replies" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_daily_report_replies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "staff_daily_reports_reportDate_idx" ON "staff_daily_reports"("reportDate");

-- CreateIndex
CREATE UNIQUE INDEX "staff_daily_reports_userId_reportDate_key" ON "staff_daily_reports"("userId", "reportDate");

-- CreateIndex
CREATE INDEX "staff_daily_report_replies_reportId_createdAt_idx" ON "staff_daily_report_replies"("reportId", "createdAt");

-- AddForeignKey
ALTER TABLE "staff_daily_reports" ADD CONSTRAINT "staff_daily_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_daily_report_replies" ADD CONSTRAINT "staff_daily_report_replies_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "staff_daily_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_daily_report_replies" ADD CONSTRAINT "staff_daily_report_replies_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
