/*
  Warnings:

  - A unique constraint covering the columns `[resource,action]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `action` to the `Permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resource` to the `Permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Role` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('SUPER_ADMIN', 'CUSTOM');

-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "action" TEXT NOT NULL,
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "resource" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "type" "RoleType" NOT NULL DEFAULT 'CUSTOM';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdById" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Permission_resource_action_key" ON "Permission"("resource", "action");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
