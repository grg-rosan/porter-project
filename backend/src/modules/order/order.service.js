import { prisma } from "../../config/db.config.js";
import calculateFare from "../../shared/utils/calculateFare.js";
import getDistance from "../../shared/utils/getDistance.js";

export const createOrder = async (orderData) => {
  try {
    const { pickup_address, drop_address, order_weight, vehicle_type, userID } =
      orderData;

    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userID },
    });

    if (!customerProfile) {
      throw new Error("customer profile not found");
    }

    const pickupLoc = JSON.parse(pickup_address) 
    const dropLoc   = JSON.parse(drop_address)
    const {distance_km, duration_min} = await getDistance(pickupLoc, dropLoc)

    const { fare } = calculateFare({
      distance_km,
      duration_min,
      vehicle_type,
      weight_kg: order_weight,
    });

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
    throw new Error("Order creation failed: " + error.message);
  }
};

export  const cancel_Order = async(orderID)  => {

  const order = await prisma.order.findUnique({
    where : {ID: parseInt(orderID)}
  })


  if(!order) throw new Error("Order not Found");
  if(order.order_status === "CANCELLED"){
    throw new Error("Order is already Cancelled");
  }

  if(order.order_status === "DELIVERED"){
    throw new Error("Order already Delivered")
  }
  const canceledOrder = await prisma.order.update({
    where: {ID : parseInt(orderID)},
    data :{ order_status: "CANCELLED"}
  })
  return canceledOrder
}
