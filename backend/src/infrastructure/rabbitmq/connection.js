import amqp from "amqplib"

let connection = null;
let channel = null;

export const connectRabbitMq = async()  => {
    try {
        if( connection && channel) return {connection,channel}
        connection = await amqp.connect(process.env.RABBITMQ_URL);// move this url to .env file
        channel = await connection.createChannel()

        console.log("rabbitmq connected successfully")

        return {connection, channel}
    } catch (error) {
        console.error("rabbitmq conn error", error.message)
        throw error
    }
}
export const closeRabbitMQ = async () => {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    console.log("RabbitMQ connection closed");
  } catch (error) {
    console.error("RabbitMQ closing error:", error.message);
  }
  finally{
    connection = null;
    channel = null
  }
};