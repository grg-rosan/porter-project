import { cancel_Order, createOrderService } from "./order.service.js";
import orderMessageProducer from "./order.producer.js";
import getDistance from "../../utils/getDistance.js";
import {calculateFare} from "../../utils/calculateFare.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { geoCode } from "../../utils/geocode.js";
import { sendNotification } from "../../utils/notification.js";

export const estimateFare = asyncHandler(async (req, res) => {
  const { pickup_address, drop_address, weight_kg, vehicle_type } = req.body;

  const pick_up = await geoCode(pickup_address);
  const drop_off = await geoCode(drop_address);

  const { distance_km, duration_min } = await getDistance(pick_up, drop_off);

  const estimate = await calculateFare({
    distance_km,
    duration_min,
    weight_kg: parseFloat(weight_kg),
    vehicle_type,
  });
  console.log(estimate)
  res.status(200).json({ status: "success", estimate: estimate });
});

export const order_create = asyncHandler(async (req, res) => {
  const order = await createOrderService({ ...req.body, userID: req.user.userID });

  await Promise.allSettled([
    orderMessageProducer({
      orderId: order.ID,
      customerId: order.customerID,
      vehicleType: order.vehicle_type,
      riderId: order.riderID, // assigned rider
      pick_up: order.pickup_address,
      drop_off: order.drop_address,
      amount: order.total_amount,
    }),
    sendNotification(
      req.user.userID,
      "ORDER_PLACED",
      "Your order has been placed successfully",
      order.ID,
    ),
  ]);
  res.status(201).json({
    status: "success",
    order,
  });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const orderID = parseInt(req.params.orderID);
  const order = await cancel_Order(orderID, req.user.userID);
  const notifications = [];

  notifications.push(
    sendNotification(
      req.user.userID,
      "ORDER_CANCELLED",
      "Your order has been cancelled",
      orderID,
    ),
  );
  if (order.riderProfile?.userID) {
    notifications.push(
      sendNotification(
        order.riderID,
        "ORDER_CANCELLED",
        "The order has been cancelled by the customer",
        orderID,
      ),
    );
  }
  await Promise.allSettled(notifications);
  res.json({ status: "success", data: order });
});
