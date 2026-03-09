import { consumeMessage } from "../../infrastructure/rabbitmq/subscriber";
import { notifyRider } from "./notification.service";

const startNotificationConsumer  = async() => {
    await consumeMessage("orders","orders.created","notification_queue",async(message)=>{
        console.log("new message recived:", message)
        await notifyRider(message)
    })
}