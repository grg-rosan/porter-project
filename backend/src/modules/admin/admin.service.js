import { prisma } from "../../config/db.config.js"
import AppError from "../../utils/AppError.js"

// verification
export const getPendingDocsService = async () => {
  return await prisma.riderProfile.findMany({
    where:   { verificationStatus: "PENDING" },
    include: { user: { select: { name: true, email: true } } },
  })
}

export const getRiderVerificationsService = async (status) => {
  return await prisma.riderProfile.findMany({
    where:   status ? { verificationStatus: status } : {},
    select: {
      riderID:            true,
      vehicle_type:       true,
      vehicle_number:     true,
      verificationStatus: true,
      createdAt:          true,
      license_image:      true,
      governmentID_image: true,
      vehicle_image:      true,
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export const getRiderDetailsService = async (riderID) => {
  const profile = await prisma.riderProfile.findUnique({
    where:  { riderID },
    select: {
      riderID:            true,
      phone:              true,
      vehicle_type:       true,
      vehicle_number:     true,
      license_number:     true,
      verificationStatus: true,
      verificationNote:   true,
      license_image:      true,
      governmentID_image: true,
      vehicle_image:      true,
      user: { select: { name: true, email: true } },
    },
  })
  if (!profile) throw new AppError("Rider not found", 404)
  return profile
}

export const reviewDocsService = async (riderID, status, reason) => {
  const profile = await prisma.riderProfile.findUnique({ where: { riderID } })
  if (!profile) throw new AppError("Rider profile not found", 404)
  if (profile.verificationStatus !== "PENDING")
    throw new AppError("No pending documents to review", 400)

  return await prisma.riderProfile.update({
    where: { riderID },
    data: {
      verificationStatus: status,
      isVerified:         status === "VERIFIED",
      verificationNote:   reason ?? null,
    },
  })
}

// complaints
export const getComplaintsService = async (status) => {
  return await prisma.notification.findMany({
    where: {
      type:   "COMPLAINT",
      ...(status ? { isRead: status === "RESOLVED" } : {}),
    },
    include: {
      user:  { select: { name: true, email: true } },
      order: { select: { ID: true, order_status: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export const resolveComplaintService = async (id) => {
  const complaint = await prisma.notification.findUnique({ where: { ID: id } })
  if (!complaint)       throw new AppError("Complaint not found", 404)
  if (complaint.isRead) throw new AppError("Complaint already resolved", 400)

  return await prisma.notification.update({
    where: { ID: id },
    data:  { isRead: true },
  })
}

// analytics
export const getAnalyticsService = async () => {
  const [ordersByStatus, revenueByDay, riderStats] = await Promise.all([
    // orders breakdown by status
    prisma.order.groupBy({
      by:    ["order_status"],
      _count: { ID: true },
    }),
    // revenue last 30 days
    prisma.order.groupBy({
      by:    ["createdAt"],
      _sum:  { total_amount: true },
      where: {
        payment_status: "PAID",
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
    // rider stats
    prisma.riderProfile.aggregate({
      _avg:   { rating: true },
      _sum:   { totalDeliveries: true },
      _count: { riderID: true },
    }),
  ])

  return { ordersByStatus, revenueByDay, riderStats }
}

// user management
export const blockUserService = async (userID, reason) => {
  const user = await prisma.user.findUnique({ where: { userID } })
  if (!user)           throw new AppError("User not found", 404)
  if (user.isBlocked)  throw new AppError("User already blocked", 400)

  return await prisma.user.update({
    where: { userID },
    data:  { isBlocked: true, blockedAt: new Date(), blockReason: reason },
  })
}

export const unblockUserService = async (userID) => {
  const user = await prisma.user.findUnique({ where: { userID } })
  if (!user)           throw new AppError("User not found", 404)
  if (!user.isBlocked) throw new AppError("User is not blocked", 400)

  return await prisma.user.update({
    where: { userID },
    data:  { isBlocked: false, blockedAt: null, blockReason: null },
  })
}