import {publishMessage} from "../../infrastructure/rabbitmq/publisher.js"

const orderMessageProducer = async(message) => {
    await publishMessage("orders","order.created",message)
}
export default orderMessageProducer;