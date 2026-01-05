-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN "courses" TEXT[] DEFAULT ARRAY[]::TEXT[];
