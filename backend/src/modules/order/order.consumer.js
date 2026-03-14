import { consumeMessage } from "../../infrastructure/rabbitmq/subscriber.js";

export const startOrderConsumer = (io) => {
  consumeMessage("orders", "order.created", "order_queue", (message) => {
    console.log("Received order message:", message);
    io.to(`riders:${message.vehicleType}`).emit("order:new",{
        orderID: message.orderId,
                customerID: message.customerId,
                pickup: message.pickup,
                dropoff: message.dropoff,
                amount: message.amount
    })
  });
};
