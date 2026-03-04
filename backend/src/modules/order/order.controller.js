import createOrder  from "./order.service.js";
// import orderMessageProducer from "../messaging/orderProducer.js";

async function order_create(req, res) {
  try {
    const order = await createOrder(req.body);
    // orderMessageProducer("order.success",order)

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
