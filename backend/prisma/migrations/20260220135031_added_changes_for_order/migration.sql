/*
  Warnings:

  - A unique constraint covering the columns `[userID]` on the table `CustomerProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userID]` on the table `RiderProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userID` to the `CustomerProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicle_type` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userID` to the `RiderProfile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('BIKE', 'SCOOTER', 'VAN', 'PICKUP_JEEP');

-- DropForeignKey
ALTER TABLE "CustomerProfile" DROP CONSTRAINT "CustomerProfile_customerID_fkey";

-- DropForeignKey
ALTER TABLE "RiderProfile" DROP CONSTRAINT "RiderProfile_riderID_fkey";

-- AlterTable
ALTER TABLE "CustomerProfile" ADD COLUMN     "userID" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "vehicle_type" "VehicleType" NOT NULL;

-- AlterTable
ALTER TABLE "RiderProfile" ADD COLUMN     "userID" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProfile_userID_key" ON "CustomerProfile"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "RiderProfile_userID_key" ON "RiderProfile"("userID");

-- AddForeignKey
ALTER TABLE "RiderProfile" ADD CONSTRAINT "RiderProfile_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerProfile" ADD CONSTRAINT "CustomerProfile_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;
