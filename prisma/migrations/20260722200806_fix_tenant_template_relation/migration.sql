/*
  Warnings:

  - The primary key for the `tenant_templates` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `tenant_templates` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "tenant_templates" DROP CONSTRAINT "tenant_templates_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD CONSTRAINT "tenant_templates_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "tenant_templates_tenantId_idx" ON "tenant_templates"("tenantId");
