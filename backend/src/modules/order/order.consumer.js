import { consumeMessage } from "../../infrastructure/rabbitmq/subscriber.js";

consumeMessage(
  "orders",
  "order.created",
  "order_queue",
  (message) => {
    console.log("Received order message:", message);
    // e.g., send push notification or email
  },
);
