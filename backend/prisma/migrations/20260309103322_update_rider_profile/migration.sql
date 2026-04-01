/*
  Warnings:

  - You are about to drop the column `available_status` on the `RiderProfile` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `RiderProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[license_number]` on the table `RiderProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `license_number` to the `RiderProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `RiderProfile` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `vehicle_type` on the `RiderProfile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "RiderProfile" DROP COLUMN "available_status",
DROP COLUMN "location",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "license_number" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profileImage" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "totalDeliveries" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "vehicle_number" TEXT,
DROP COLUMN "vehicle_type",
ADD COLUMN     "vehicle_type" "VehicleType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "RiderProfile_license_number_key" ON "RiderProfile"("license_number");
