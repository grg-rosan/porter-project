import { prisma } from "../../config/db.config.js";
import {calculateFare} from "../../utils/calculateFare.js";
import getDistance from "../../utils/getDistance.js";
import AppError from "../../utils/AppError.js";
import { SURGE_FALLBACK } from "../../config/surge.config.js"



export const createOrderService = async (orderData) => {

  const { pickup_address, drop_address, weight_kg, vehicle_type, userID } = orderData;

  const customerProfile = await prisma.customerProfile.findUnique({
    where: { userID },
  });
  if (!customerProfile) throw new AppError("Customer profile not found", 404);

  let pickup_loc, drop_off_loc;
  try {
    pickup_loc = JSON.parse(pickup_address);
    drop_off_loc   = JSON.parse(drop_address);
  } catch {
    throw new AppError("Invalid pickup or drop address format", 400);
  }

  const { distance_km, duration_min } = await getDistance(pickup_loc, drop_off_loc);
  const { estimatedFare, surgeMultiplier, finalFare } = await calculateFare({
    distance_km,
    duration_min,
    vehicle_type,
    weight_kg
  });

  return await prisma.order.create({
    data: {
      customerID:     customerProfile.customerID,
      pickup_address: JSON.stringify(pickup_loc),  // keep as JSON string in DB
      drop_address:   JSON.stringify(drop_off_loc),
      vehicle_type,
      weight_kg,
      estimatedFare,
      surgeMultiplier,
      finalFare
    },
  });
};


export const cancel_Order = async (orderID, userID) => {
  const order = await prisma.order.findUnique({
    where: { ID: parseInt(orderID) },
    include: {
      riderProfile: {
        select: { userID: true },
      },
    },
  });

  if (!order) throw new AppError("Order not Found", 404);

  const customerProfile = await prisma.customerProfile.findUnique({
    where: { userID },
  });

  if (order.customerID !== customerProfile?.customerID)
    throw new AppError("Not Authorized to cancel this order", 403);

  if (order.order_status === "CANCELLED") {
    throw new AppError("Order is already Cancelled", 400);
  }
  if (order.order_status === "DELIVERED") {
    throw new AppError("Order already Delivered", 400);
  }
  if (order.order_status === "PICKED_UP")
    // ✅ add this check
    throw new AppError("Cannot cancel order that is already picked up", 400);

  return await prisma.order.update({
    where: { ID: parseInt(orderID) },
    data: { order_status: "CANCELLED" },
    include: {
      riderProfile: { select: { userID } },
    },
  });
};


export const getSurgeMultiplierService = async () => {
  try {
    const config = await prisma.surgeConfig.findUnique({ where: { id: 1 } });
    if (config?.isActive) return config.multiplier; // admin override wins

    const [pendingOrders, availableRiders] = await Promise.all([
      prisma.order.count({ where: { order_status: "PENDING" } }),
      prisma.riderProfile.count({ where: { isAvailable: true } }),
    ]);

    if (availableRiders === 0) return 2.0;

    const ratio = pendingOrders / availableRiders;
    if (ratio >= 3) return 1.8;
    if (ratio >= 2) return 1.5;
    if (ratio >= 1) return 1.2;
    return 1.0;

  } catch (err) {
    console.error("Surge calculation failed, using fallback:", err.message);
    return SURGE_FALLBACK.multiplier;
  }
};

export const getSurgeStatusService = async () => {
  try {
    return await prisma.surgeConfig.findUnique({ where: { id: 1 } }) ?? SURGE_FALLBACK;
  } catch {
    return SURGE_FALLBACK;
  }
};

export const updateSurgeService = async ({ isActive, multiplier, reason }) => {
  if (isActive && (!multiplier || multiplier < 1)) {
    throw new AppError("Multiplier must be >= 1 when activating surge", 400);
  }

  return await prisma.surgeConfig.upsert({
    where: { id: 1 },
    update: {
      isActive,
      multiplier: isActive ? multiplier : 1.0,
      reason: isActive ? (reason ?? null) : null,
      activatedAt: isActive ? new Date() : undefined,
      deactivatedAt: !isActive ? new Date() : undefined,
    },
    create: {
      id: 1,
      isActive: isActive ?? false,
      multiplier: multiplier ?? 1.0,
      reason: reason ?? null,
    },
  });
};