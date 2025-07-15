/*
  Warnings:

  - You are about to drop the column `planId` on the `CasoPrueba` table. All the data in the column will be lost.
  - Added the required column `versionId` to the `CasoPrueba` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CasoPrueba" DROP CONSTRAINT "CasoPrueba_planId_fkey";

-- AlterTable
ALTER TABLE "CasoPrueba" DROP COLUMN "planId",
ADD COLUMN     "versionId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "CasoPrueba" ADD CONSTRAINT "CasoPrueba_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
