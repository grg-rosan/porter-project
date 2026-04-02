//complaints.service.js

export const createComplaint = async (
  userID,
  role,
  { orderID, type, description },
) => {
  // verify the order involves this user
  const order = await prisma.order.findUnique({
    where: { ID: orderID },
    include: {
      customerProfile: { select: { userID: true } },
      riderProfile: { select: { userID: true } },
    },
  });
  if (!order) throw new AppError("Order not found", 404);

  // check this user is actually part of the order
  const isCustomer = order.customerProfile.userID === userID;
  const isRider = order.riderProfile?.userID === userID;
  if (!isCustomer && !isRider)
    throw new AppError("Not authorized to complain about this order", 403);

  // only on completed or cancelled orders
  if (!["DELIVERED", "CANCELLED"].includes(order.order_status))
    throw new AppError(
      "You can only file a complaint after the order is completed or cancelled",
      400,
    );

  // prevent duplicate complaints from same user on same order
  const existing = await prisma.complaint.findFirst({
    where: { orderID, filedByUserID: userID },
  });
  if (existing)
    throw new AppError("You already filed a complaint for this order", 409);

  // the complaint is against the other party
  const againstUserID = isCustomer
    ? (order.riderProfile?.userID ?? null) // customer complains against rider
    : order.customerProfile.userID; // rider complains against customer

  return await prisma.complaint.create({
    data: {
      filedByUserID: userID,
      filedByRole: role, // "CUSTOMER" or "RIDER"
      orderID,
      againstUserID,
      type,
      description,
    },
  });
};

export const getMyComplaints = async (userID) => {
  return await prisma.complaint.findMany({
    where: { filedByUserID: userID },
    orderBy: { createdAt: "desc" },
    include: {
      order: { select: { ID: true, pickup_address: true, drop_address: true } },
      against: { select: { name: true, email: true } },
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// complaints/complaints.service.js  (updated)
// ─────────────────────────────────────────────────────────────────────────────
//
// BUGS FIXED:
//   1. resolveComplaintService accepted only (id) but admin.controller passes (id, body)
//      → added `body` param and read `action` from it (resolve vs dismiss)
//   2. getComplaintsService used no pagination — added skip/take
//   3. include block on the `against` user so the frontend can read isBlocked
//   4. Missing total count in response for pagination UI
//
// ─────────────────────────────────────────────────────────────────────────────

import { prisma } from "../../config/db.config.js";
import AppError from "../../utils/AppError.js";

export const getComplaintsService = async ({ status, page = 1, limit = 20 } = {}) => {
  const where = status ? { status: status.toUpperCase() } : {};
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [complaints, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        filedBy: { select: { name: true, email: true } }, // Match Schema
        against: { select: { name: true, isBlocked: true } }, // Match Schema
        order:   { select: { ID: true, vehicle_type: true } }
      },
    }),
    prisma.complaint.count({ where }),
  ]);

  return {
    data: complaints,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / (take || 20)),
  };
};

export const resolveComplaintService = async (id, body = {}) => {
  const complaint = await prisma.complaint.findUnique({ where: { id } });
  if (!complaint) throw new AppError("Complaint not found", 404);

  // body.status can be "RESOLVED" or "DISMISSED" — default to RESOLVED
  const newStatus = ["RESOLVED", "DISMISSED"].includes(
    body.status?.toUpperCase(),
  )
    ? body.status.toUpperCase()
    : "RESOLVED";

  return await prisma.complaint.update({
    where: { id },
    data: { status: newStatus },
  });
};
