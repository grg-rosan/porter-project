/*
  Warnings:

  - You are about to drop the column `isVerified` on the `CustomerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `verificationStatus` on the `CustomerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `order_weight` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `total_amount` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `RiderProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[governmentID]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `estimatedFare` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalFare` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight_kg` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ComplaintType" AS ENUM ('RIDER_BEHAVIOR', 'LATE_DELIVERY', 'WRONG_ITEM', 'PAYMENT_ISSUE', 'OTHER');

-- CreateEnum
CREATE TYPE "ComplaintRole" AS ENUM ('CUSTOMER', 'RIDER');

-- AlterTable
ALTER TABLE "CustomerProfile" DROP COLUMN "isVerified",
DROP COLUMN "verificationStatus",
ADD COLUMN     "profileImage_publicId" TEXT;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "order_weight",
DROP COLUMN "total_amount",
ADD COLUMN     "estimatedFare" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "finalFare" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "surgeMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
ADD COLUMN     "weight_kg" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "RiderProfile" DROP COLUMN "isVerified",
ADD COLUMN     "governmentID_publicId" TEXT,
ADD COLUMN     "license_publicId" TEXT,
ADD COLUMN     "profileImage_publicId" TEXT,
ADD COLUMN     "vehicle_model" TEXT,
ADD COLUMN     "vehicle_publicId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "blockReason" TEXT,
ADD COLUMN     "governmentID" TEXT,
ADD COLUMN     "governmentID_image" TEXT,
ADD COLUMN     "governmentID_publicId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verificationNote" TEXT,
ADD COLUMN     "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED';

-- CreateTable
CREATE TABLE "FareConfig" (
    "id" SERIAL NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,
    "baseFare" DOUBLE PRECISION NOT NULL,
    "perKm" DOUBLE PRECISION NOT NULL,
    "perKg" DOUBLE PRECISION NOT NULL,
    "minFare" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FareConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurgeConfig" (
    "id" SERIAL NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "multiplier" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "SurgeConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "ID" SERIAL NOT NULL,
    "filedByUserID" TEXT NOT NULL,
    "filedByRole" "ComplaintRole" NOT NULL,
    "orderID" INTEGER NOT NULL,
    "againstUserID" TEXT,
    "type" "ComplaintType" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'OPEN',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "FareConfig_vehicleType_key" ON "FareConfig"("vehicleType");

-- CreateIndex
CREATE UNIQUE INDEX "User_governmentID_key" ON "User"("governmentID");

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_filedByUserID_fkey" FOREIGN KEY ("filedByUserID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_againstUserID_fkey" FOREIGN KEY ("againstUserID") REFERENCES "User"("userID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_orderID_fkey" FOREIGN KEY ("orderID") REFERENCES "Order"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;
