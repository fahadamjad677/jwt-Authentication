-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lockTime" TIMESTAMP(3),
ALTER COLUMN "loginAttempts" SET DEFAULT 0;
