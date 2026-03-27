import App from "../../../../frontend/src/App";
import { prisma } from "../../config/db.config.js";
import AppError from "../../utils/AppError";
import asyncHandler from "../../utils/asyncHandler";
import { getPendingDocsService, reviewDocsService } from "./admin.service";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalRides,
    totalRevenue,
    activeRiders,
    pendingVerify,
    openComplaints,
    blockedUsers,
    weeklyRides,
  ] = await Promise.all([
    // total rides
    prisma.order.count(),

    // total revenue — sum of paid orders
    prisma.order.aggregate({
      _sum: { total_amount: true },
      where: { payment_status: "PAID" },
    }),

    // active riders — online right now
    prisma.riderProfile.count({
      where: { isAvailable: true },
    }),

    // pending verification
    prisma.riderProfile.count({
      where: { verificationStatus: "PENDING" },
    }),

    // open complaints
    prisma.notification.count({
      where: { type: "COMPLAINT", status: "OPEN" },
    }),

    // blocked users
    prisma.user.count({
      where: { isBlocked: true },
    }),

    // weekly rides — Mon to Sun
    prisma.order.groupBy({
      by: ["createdAt"],
      _count: { ID: true },
      where: {
        createdAt: {
          gte: getStartOfWeek(), // Monday 00:00
          lte: new Date(),
        },
      },
    }),
  ]);

  res.status(200).json({
    status: "success",
    data: {
      totalRides,
      revenue: totalRevenue._sum.total_amount ?? 0,
      activeRiders,
      pendingVerify,
      openComplaints,
      blockedUsers,
      weeklyRides,
    },
  });
});

// helper — get Monday of current week
const getStartOfWeek = () => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust to Monday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

//get pending documents of riders
export const getPendingDocs = asyncHandler(async (req, res) => {
  const docs = await getPendingDocsService();
  res.status(200).json({ status: "success", count: docs.length, data: docs });
});

//review docs of riders
export const reviewDocs = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;

  const { riderID } = req.params;

  if (!["VERIFIED", "REJECTED"].includes(status))
    throw new AppError("Status must be Approved or rejected", 400);
  if (status === "REJECTED" && !reason)
    throw new AppError("Rejection reason is required", 400);

  const docs = await reviewDocsService(riderID, status, reason);
  res.status(200).json({ status: "success", data: docs });
});

export const getRiderVerifications = asyncHandler(async (req, res) => {
  const { status } = req.query; // ?status=PENDING

  // validate if status is provided
  if (status && !["PENDING", "VERIFIED", "REJECTED", "UNVERIFIED"].includes(status))
    throw new AppError("Invalid status filter", 400);

  const riders = await getRiderVerificationsService(status);
  res.status(200).json({
    status: "success",
    count:  riders.length,
    data:   riders,
  });
});

export const getRiderDetails = asyncHandler(async (req, res) => {
  const { riderID } = req.params;
  const profile = await getRiderDetailsService(riderID);
  res.status(200).json({ status: "success", data: profile });
});