import express from "express";
import {estimateFare, order_create} from "../order/order.controller.js";

const router = express.Router();

//create order api
router.post("/create",order_create);
//api/customer/orders/create

router.post("/estimate",estimateFare)

export default router;
