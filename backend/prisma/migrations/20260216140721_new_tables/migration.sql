/*
  Warnings:

  - The values [PAYED] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `userID` on the `Order` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ID` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Rider` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `customerID` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.
  - The required column `userID` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'Rider', 'ADMIN');

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('PENDING', 'PAID', 'FAILED');
ALTER TABLE "public"."Order" ALTER COLUMN "payment_status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "payment_status" TYPE "PaymentStatus_new" USING ("payment_status"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "public"."PaymentStatus_old";
ALTER TABLE "Order" ALTER COLUMN "payment_status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_riderID_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userID_fkey";

-- DropIndex
DROP INDEX "Payment_orderID_key";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "userID",
ADD COLUMN     "customerID" TEXT NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "ID",
ADD COLUMN     "role" "Role" NOT NULL,
ADD COLUMN     "userID" TEXT NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("userID");

-- DropTable
DROP TABLE "Rider";

-- CreateTable
CREATE TABLE "RiderProfile" (
    "riderID" TEXT NOT NULL,
    "vehicle_type" TEXT NOT NULL,
    "available_status" BOOLEAN NOT NULL,
    "location" TEXT NOT NULL,

    CONSTRAINT "RiderProfile_pkey" PRIMARY KEY ("riderID")
);

-- CreateTable
CREATE TABLE "CustomerProfile" (
    "customerID" TEXT NOT NULL,
    "address" TEXT,

    CONSTRAINT "CustomerProfile_pkey" PRIMARY KEY ("customerID")
);

-- AddForeignKey
ALTER TABLE "RiderProfile" ADD CONSTRAINT "RiderProfile_riderID_fkey" FOREIGN KEY ("riderID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerProfile" ADD CONSTRAINT "CustomerProfile_customerID_fkey" FOREIGN KEY ("customerID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerID_fkey" FOREIGN KEY ("customerID") REFERENCES "CustomerProfile"("customerID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_riderID_fkey" FOREIGN KEY ("riderID") REFERENCES "RiderProfile"("riderID") ON DELETE SET NULL ON UPDATE CASCADE;
