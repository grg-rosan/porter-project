import { connectRabbitMq } from "./connection.js";

export const consumeMessage = async (exchange, routingKey, queue, callback) => {
  try {
    const { channel } = await connectRabbitMq();

    await channel.assertExchange(exchange, "topic", { durable: true });
    await channel.assertQueue(queue, { durable: true });

    await channel.bindQueue(queue, exchange, routingKey);
    console.log(`📥 Waiting for messages in queue: ${queue}`);

    channel.consume(
      queue,
      (message) => {
        if (message != null) {
          const content = JSON.parse(message.content.toString());
          console.log("recevieNotfication:", content);
          channel.ack(message);
          callback(content) 
        }
      },
      {
        noAck: false,
      },
    );
  } catch (error) {
    console.log("consumer error", error.message);
  }
};
