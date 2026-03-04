import { prisma } from "../../config/db.config.js";
import { geoCode } from "../location/searchLocation.js";
import { calculateDistance } from "../../services/dstance.service.js";
import { calculateFare } from "../../services/pricing.service.js";
import { getSurgeMultiplier } from "../../services/surge.service.js";
// import orderMessageProducer from "./order.prducer.js";

const createOrder = async (orderData) => {
  try {
    const { pickup_address, drop_address, order_weight, vehicle_type } =
      orderData;

    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userID: req.user.userID },
    });

    if (!customerProfile) {
      throw new Error("customer profile not found");
    }

    //get lat and lng form geocode
    const pickupLoc = await geoCode(pickup_address);
    const dropLoc = await geoCode(drop_address);
    //If your geocoding service supports batch requests,
    //you could optimize further by sending both addresses in one API call.
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
        pickup_address: JSON.stringify(pickup_address),
        drop_address: JSON.stringify(drop_address),
        vehicle_type,
        order_weight,
        total_amount: fare,
      },
    });
    // orderMessageProducer(order)
    return order;
  } catch (error) {
    throw new Error("Order creation failed: " + error.message);
  }
};

export default createOrder;
