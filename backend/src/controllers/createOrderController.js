import { prisma } from "../config/db.config.js";
import orderMessageProducer from "../messaging/orderProducer.js";
import { calculateDistance } from "../services/dstance.service.js";
import { calculateFare } from "../services/pricing.service.js";
import { getSurgeMultiplier } from "../services/surge.service.js";

const createOrder = async (req, res) => {
  try {
    const { pickup_address, drop_address, order_weight, vehicle_type } = req.body;

     const customerProfile = await prisma.customerProfile.findUnique({
      where: { userID: req.user.userID },
    });

    if (!customerProfile) {
      return res.status(400).json({ error: "Customer profile not found" });
    }

    console.log("padd:",pickup_address);
    console.log("dadd:",drop_address);
    console.log("ow:",order_weight)
    console.log("vt:",vehicle_type)

    const distance = calculateDistance(pickup_address, drop_address);

    const currentDemand = Math.floor(Math.random() * 100);
    const surgeMultiplier = getSurgeMultiplier(currentDemand);
    const fare = calculateFare({
      distance,
      vehicle_type,
      weightKg: order_weight,
      surgeMultiplier,
    });
    console.log("fare:",fare)

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
    orderMessageProducer("order.success",order)
    res.status(201).json({
      status: "success",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "order creation failed", error: error.message });
  }
};
export default createOrder;
