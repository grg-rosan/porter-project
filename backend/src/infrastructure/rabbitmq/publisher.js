//this is generic message producer that can be used by any routing key and queue

import {connectRabbitMq} from "./connection.js"

export const publishMessage = async (exchange, routingKey, message) => {
    try {
        const {channel}  = await connectRabbitMq();
        
        await channel.assertExchange(exchange,"topic", {durable: true})

        channel.publish(exchange,routingKey, Buffer.from(JSON.stringify(message)))
            console.log(`📤 Message sent to exchange: ${exchange}, key: ${routingKey}`, message);
    } catch (error) {
        console.log("producer error", error.message)
    }
}