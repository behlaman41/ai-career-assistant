/*
  Warnings:

  - Added the required column `sizeBytes` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "UploadStatus" AS ENUM ('pending', 'scanning', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "meta" JSONB,
ADD COLUMN     "scanResult" JSONB,
ADD COLUMN     "sizeBytes" INTEGER NOT NULL,
ADD COLUMN     "status" "UploadStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'user';

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
