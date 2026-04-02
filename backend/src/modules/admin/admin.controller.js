// ─────────────────────────────────────────────────────────────────────────────
// admin.controller.js  — getDashboardStats fix
// ─────────────────────────────────────────────────────────────────────────────
//
// BUG: prisma.order.groupBy({ by: ["createdAt"] }) groups by the full DateTime,
//      producing one bucket per second rather than per day.
//      Fix: use $queryRaw to truncate to day, OR post-process in JS (below).
//
// The safest cross-DB fix (no raw SQL) is to fetch orders for the week and
// bucket them in JS, which is what formatWeeklyRides already tries to do —
// but it uses `new Date(ride.createdAt).toLocaleDateString("en-US", { weekday: "short" })`
// which returns "Mon", "Tue" etc. in the SERVER locale, which may not be "en-US".
//
// Replace getDashboardStats with this version:
// ─────────────────────────────────────────────────────────────────────────────

import { prisma }      from "../../config/db.config.js";
import AppError        from "../../utils/AppError.js";
import asyncHandler    from "../../utils/asyncHandler.js";
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

// ── Helpers ──────────────────────────────────────────────────────────────────
const getStartOfWeek = () => {
  const now  = new Date();
  const day  = now.getDay();                       // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day;          // shift to Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// bucket raw orders (each has a createdAt Date) into Mon-Sun counts
const formatWeeklyRides = (orders) => {
  const counts = Object.fromEntries(DAYS.map((d) => [d, 0]));
  for (const order of orders) {
    const d = new Date(order.createdAt);
    // getDay(): 0=Sun,1=Mon,...,6=Sat  → map to Mon-Sun label
    const idx = (d.getDay() + 6) % 7;             // Mon=0 … Sun=6
    counts[DAYS[idx]] = (counts[DAYS[idx]] ?? 0) + 1;
  }
  return DAYS.map((day) => ({ day, rides: counts[day] }));
};

// ── Controller ────────────────────────────────────────────────────────────────
// admin.controller.js
export const getDashboardStats = asyncHandler(async (req, res) => {
  const weekStart = getStartOfWeek();

  const [
    totalRides,
    revenueAgg,
    activeRiders,
    pendingVerify,
    openComplaints,
    blockedUsers,
    weekOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({
      _sum:  { finalFare: true }, // FIXED: Field name is finalFare in your schema
      where: { payment_status: "PAID" },
    }),
    prisma.riderProfile.count({ where: { isAvailable: true } }),
    // FIXED: verificationStatus is on RiderProfile in your schema
    prisma.riderProfile.count({ where: { verificationStatus: "PENDING" } }), 
    prisma.complaint.count({ where: { status: "OPEN" } }),
    prisma.user.count({ where: { isBlocked: true } }),
    prisma.order.findMany({
      where:  { createdAt: { gte: weekStart } },
      select: { createdAt: true },
    }),
  ]);

  res.status(200).json({
    status: "success",
    data: {
      totalRides,
      revenue:        revenueAgg._sum.finalFare ?? 0,
      activeRiders,
      pendingVerify,
      openComplaints,
      blockedUsers,
      weeklyRides:    formatWeeklyRides(weekOrders),
    },
  });
});

// ── All other controllers unchanged — re-export them below ───────────────────

export const getPendingDocs = asyncHandler(async (req, res) => {
  const docs = await getPendingDocsService();
  res.status(200).json({ status: "success", count: docs.length, data: docs });
});

export const getRiderVerifications = asyncHandler(async (req, res) => {
  const { status } = req.query;
  if (status && !["PENDING", "VERIFIED", "REJECTED", "UNVERIFIED"].includes(status))
    throw new AppError("Invalid status filter", 400);
  const riders = await getRiderVerificationsService(status);
  res.status(200).json({ status: "success", count: riders.length, data: riders });
});

export const getRiderDetails = asyncHandler(async (req, res) => {
  const profile = await getRiderDetailsService(req.params.riderID);
  res.status(200).json({ status: "success", data: profile });
});

export const reviewDocs = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;
  const { riderID }        = req.params;
  if (!["VERIFIED", "REJECTED"].includes(status))
    throw new AppError("Status must be VERIFIED or REJECTED", 400);
  if (status === "REJECTED" && !reason)
    throw new AppError("Rejection reason is required", 400);
  const docs = await reviewDocsService(riderID, status, reason);
  res.status(200).json({ status: "success", data: docs });
});

//complaints
export const getComplaints = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query;
  const complaints = await getComplaintsService({ status, page, limit });
  res.status(200).json({ status: "success", ...complaints });
});

export const resolveComplaint = asyncHandler(async (req, res) => {
  const complaint = await resolveComplaintService(parseInt(req.params.id), req.body);
  res.status(200).json({ status: "success", data: complaint });
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const data = await getAnalyticsService();
  res.status(200).json({ status: "success", data });
});


//user management
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


//fare & surge config controllers
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

export const getSurgeStatus = asyncHandler(async (req, res, next) => {
  try {
    const surge = await getSurgeStatusService();
    res.status(200).json({ status: "success", data: surge });
  } catch (err) { next(err); }
});

export const updateSurge = asyncHandler(async (req, res, next) => {
  try {
    const { isActive, multiplier, reason } = req.body;
    const surge = await updateSurgeService({ isActive, multiplier, reason });
    res.status(200).json({ status: "success", data: surge });
  } catch (err) { next(err); }
});