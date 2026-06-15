-- AlterTable: back-office / ERP fields on PartRequest
ALTER TABLE "PartRequest" ADD COLUMN "internalNote" TEXT;
ALTER TABLE "PartRequest" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'NORMAL';
ALTER TABLE "PartRequest" ADD COLUMN "assignee" TEXT;
ALTER TABLE "PartRequest" ADD COLUMN "tags" TEXT;
ALTER TABLE "PartRequest" ADD COLUMN "lastContactedAt" TIMESTAMP(3);

-- CreateTable: activity log / audit trail
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityLog_requestId_idx" ON "ActivityLog"("requestId");

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "PartRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
