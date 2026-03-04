import express from "express";
import {order_create} from "../order/order.controller.js";

const router = express.Router();

//create order api
router.post("/create",order_create);

export default router;
