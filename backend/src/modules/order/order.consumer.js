import { consumeMessage } from "../../infrastructure/rabbitmq/subscriber.js";

consumeMessage(
  "notification_exchange",
  "order.success",
  "order_queue",
  (message) => {
    console.log("Received order message:", message);
    // e.g., send push notification or email
  },
);
