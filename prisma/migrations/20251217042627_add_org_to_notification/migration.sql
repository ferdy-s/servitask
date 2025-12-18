/*
  Warnings:

  - Added the required column `organizationId` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Notification_userId_idx";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Notification_organizationId_userId_idx" ON "Notification"("organizationId", "userId");
