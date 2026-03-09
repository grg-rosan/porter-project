import createOrder  from "./order.service.js";
import orderMessageProducer from "./order.prducer.js";

async function order_create(req, res) {
  try {
    const order = await createOrder({...req.body, userID:req.user.userID});

     await orderMessageProducer("order.created",{
        orderId: order.ID,
        customerId: order.customerID,
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
export { order_create };
