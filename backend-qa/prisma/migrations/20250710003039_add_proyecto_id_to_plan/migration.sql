/*
  Warnings:

  - You are about to drop the column `versionId` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `proyectoId` on the `Version` table. All the data in the column will be lost.
  - Added the required column `proyectoId` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planId` to the `Version` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Plan" DROP CONSTRAINT "Plan_versionId_fkey";

-- DropForeignKey
ALTER TABLE "Version" DROP CONSTRAINT "Version_proyectoId_fkey";

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "versionId",
ADD COLUMN     "proyectoId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Version" DROP COLUMN "proyectoId",
ADD COLUMN     "planId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Version" ADD CONSTRAINT "Version_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
