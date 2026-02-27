import amqp from "amqplib";


const orderMessageProducer = async (routingKey, message) => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const exchange = "notification_exchange";
    const routingkey = "send_message";
    const exchangeType = "topic";

    await channel.assertExchange(exchange, exchangeType, { durable: true });

    channel.publish(exchange, routingkey, Buffer.from(JSON.stringify(message)));
    console.log("order_message sent",message);

    await channel.close();
    await connection.close();
  } catch (error) {
    console.log(error.message);
  }
};
export default orderMessageProducer;
