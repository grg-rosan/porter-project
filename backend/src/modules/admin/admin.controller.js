import { prisma } from "../../config/db.config.js";
import AppError from "../../utils/AppError.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { getSurgeStatusService, updateSurgeService } from "../../services/surge.service.js";
import {
  getPendingDocsService,
  reviewDocsService,
  getRiderVerificationsService,
  getRiderDetailsService,
  getAnalyticsService,
  blockUserService,
  unblockUserService,
  updateFareConfigService,
  getFareConfigsService,
} from "./admin.service.js";
import { getComplaintsService, resolveComplaintService } from "../complaints/complaints.service.js";



// dashboard
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
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total_amount: true },
      where: { payment_status: "PAID" },
    }),
    prisma.riderProfile.count({ where: { isAvailable: true } }),
    prisma.riderProfile.count({ where: { verificationStatus: "PENDING" } }),
    prisma.complaint.count({ where: { status: "OPEN" } }),
    prisma.user.count({ where: { isBlocked: true } }),
    prisma.order.groupBy({
      by: ["createdAt"],
      _count: { ID: true },
      where: { createdAt: { gte: getStartOfWeek(), lte: new Date() } },
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
      weeklyRides: formatWeeklyRides(weeklyRides),
    },
  });
});

const getStartOfWeek = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const formatWeeklyRides = (rides) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const counts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  rides.forEach((ride) => {
    const day = new Date(ride.createdAt).toLocaleDateString("en-US", {
      weekday: "short",
    });
    if (counts[day] !== undefined) counts[day] += ride._count.ID;
  });
  return days.map((day) => ({ day, count: counts[day] }));
};

// verification
export const getPendingDocs = asyncHandler(async (req, res) => {
  const docs = await getPendingDocsService();
  res.status(200).json({ status: "success", count: docs.length, data: docs });
});

export const getRiderVerifications = asyncHandler(async (req, res) => {
  const { status } = req.query;
  if (
    status &&
    !["PENDING", "VERIFIED", "REJECTED", "UNVERIFIED"].includes(status)
  )
    throw new AppError("Invalid status filter", 400);
  const riders = await getRiderVerificationsService(status);
  res
    .status(200)
    .json({ status: "success", count: riders.length, data: riders });
});

export const getRiderDetails = asyncHandler(async (req, res) => {
  const profile = await getRiderDetailsService(req.params.riderID);
  res.status(200).json({ status: "success", data: profile });
});

export const reviewDocs = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;
  const { riderID } = req.params;

  if (!["VERIFIED", "REJECTED"].includes(status))
    throw new AppError("Status must be VERIFIED or REJECTED", 400);
  if (status === "REJECTED" && !reason)
    throw new AppError("Rejection reason is required", 400);

  const docs = await reviewDocsService(riderID, status, reason);
  res.status(200).json({ status: "success", data: docs });
});

// complaints
export const getComplaints = asyncHandler(async (req, res) => {
  const { status,page, limit } = req.query; // ?status=OPEN or RESOLVED
  const complaints = await getComplaintsService({status,page, limit});
  res
    .status(200)
    .json({ status: "success", ...complaints });
});

export const resolveComplaint = asyncHandler(async (req, res) => {
  const complaint = await resolveComplaintService(parseInt(req.params.id),req.body);
  res.status(200).json({ status: "success", data: complaint });
});

// analytics
export const getAnalytics = asyncHandler(async (req, res) => {
  const data = await getAnalyticsService();
  res.status(200).json({ status: "success", data });
});

// user management
export const blockUser = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  if (!reason) throw new AppError("Block reason is required", 400);
  const user = await blockUserService(req.params.userID, reason);
  res.status(200).json({ status: "success", data: user });
});

export const unblockUser = asyncHandler(async (req, res) => {
  const user = await unblockUserService(req.params.userID);
  res.status(200).json({ status: "success", data: user });
});

export const getFareConfigs = asyncHandler(async (req, res) => {
  const data = await getFareConfigsService();
  res.json({ status: "success", data });
});

export const updateFareConfig = asyncHandler(async (req, res) => {
  const { vehicleType } = req.params;
  if (!["SCOOTER", "BIKE", "VAN", "MINI_TRUCK"].includes(vehicleType))
    throw new AppError("Invalid vehicle type", 400);

  const data = await updateFareConfigService(vehicleType, req.body);
  res.json({ status: "success", data });
});

export const getSurgeStatus = asyncHandler(async(req, res, next) => {
  try {
    const surge = await getSurgeStatusService();
    res.status(200).json({ status: "success", data: surge });
  } catch (err) {
    next(err);
  }
});

export const updateSurge = asyncHandler(async (req, res, next) => {
  try {
    const { isActive, multiplier, reason } = req.body;
    const surge = await updateSurgeService({ isActive, multiplier, reason });
    res.status(200).json({ status: "success", data: surge });
  } catch (err) {
    next(err);
  }
});
