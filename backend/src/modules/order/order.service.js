import { prisma } from "../../config/db.config.js";
import { geoCode } from "../location/searchLocation.js";
import { calculateDistance } from "../../services/distance.service.js";
import { calculateFare } from "../../services/pricing.service.js";
import { getSurgeMultiplier } from "../../services/surge.service.js";

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

    //get lat and lng form geocode
      const [pickupLoc, dropLoc] = await Promise.all([
        geoCode(pickup_address),
        geoCode(drop_address)
      ])

    const distance = calculateDistance(pickupLoc, dropLoc);

    const currentDemand = Math.floor(Math.random() * 100);
    const surgeMultiplier = getSurgeMultiplier(currentDemand);
    const fare = calculateFare({
      distance,
      vehicle_type,
      weightKg: order_weight,
      surgeMultiplier,
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
