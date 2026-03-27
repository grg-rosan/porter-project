import { prisma } from "../../config/db.config.js";
import calculateFare from "../../shared/utils/calculateFare.js";
import getDistance from "../../shared/utils/getDistance.js";
import AppError from "../../utils/AppError.js";

export const createOrder = async (orderData) => {
  const { pickup_address, drop_address, order_weight, vehicle_type, userID } =
    orderData;
  const customerProfile = await prisma.customerProfile.findUnique({
    where: { userID },
  });
  if (!customerProfile) {
    throw new AppError("customer profile not found", 404);
  }
  let pickupLoc, dropLoc;
  try {
    pickupLoc = JSON.parse(pickup_address);
    dropLoc = JSON.parse(drop_address);
  } catch (error) {
    throw new AppError("Invalid pickup or drop address format", 400);
  }
  const { distance_km, duration_min } = await getDistance(pickupLoc, dropLoc);
  const { fare } = calculateFare({
    distance_km,
    duration_min,
    vehicle_type,
    weight_kg: order_weight,
  });

  try {
    const order = await prisma.order.create({
      data: {
        customerID: customerProfile.customerID,
        pickup_address: JSON.stringify(pickupLoc),
        drop_address: JSON.stringify(dropLoc),
        vehicle_type,
        order_weight,
        total_amount: fare,
      },
    });
    return order;
  } catch (error) {
    if (error.code === "P2002")
      throw new AppError("Order creation failed", 400);
    throw error;
  }
};

export const cancel_Order = async (orderID, userID) => {
  const order = await prisma.order.findUnique({
    where: { ID: parseInt(orderID) },
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
  });
};
