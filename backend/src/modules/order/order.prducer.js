import {publishMessage} from "../../infrastructure/rabbitmq/publisher.js"

const orderMessageProducer = async(message) => {
    await publishMessage("notification_exchange","order.success",message)
}
export default orderMessageProducer;