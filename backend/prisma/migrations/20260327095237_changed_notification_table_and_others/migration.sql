/*
  Warnings:

  - Added the required column `userID` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Notification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER_PLACED', 'ORDER_ASSIGNED', 'ORDER_PICKED_UP', 'ORDER_DELIVERED', 'ORDER_CANCELLED', 'VERIFICATION_APPROVED', 'VERIFICATION_REJECTED', 'COMPLAINT', 'NEW_RIDER_APPLICATION');

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_orderID_fkey";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userID" TEXT NOT NULL,
ALTER COLUMN "orderID" DROP NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "NotificationType" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "blockedAt" TIMESTAMP(3),
ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_orderID_fkey" FOREIGN KEY ("orderID") REFERENCES "Order"("ID") ON DELETE SET NULL ON UPDATE CASCADE;
