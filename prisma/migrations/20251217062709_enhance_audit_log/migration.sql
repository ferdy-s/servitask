-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "actorName" TEXT,
ADD COLUMN     "severity" TEXT NOT NULL DEFAULT 'INFO',
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'API';

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");
