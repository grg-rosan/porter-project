import {cancel_Order, createOrder}  from "./order.service.js";
import orderMessageProducer from "./order.producer.js";

export const order_create=  async(req, res) => {
  try {
    const order = await createOrder({...req.body, userID:req.user.userID});

     await orderMessageProducer({
        orderId: order.ID,
        customerId: order.customerID,
        vehicleType: order.vehicle_type, 
        riderId: order.riderID,       // assigned rider
        pickup: order.pickup_address,
        dropoff: order.drop_address,
        amount: order.total_amount

    })

    res.status(201).json({
      status: "success",
      order,
    });
  } catch (error) {
    console.log(error);
      res.status(500).json({ status: "error", message: error.message });
  }
}
export const cancelOrder = async(req, res) => {
  try{
    const orderID = parseInt(req.params.orderID)
    const order = await cancel_Order(orderID)
    res.json({status: "success",  data: order})
  }catch(error){
    res.status(500).json({status:"error",message: error.message})
  }
}