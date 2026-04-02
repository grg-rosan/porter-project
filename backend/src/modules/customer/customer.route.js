import express from "express";
import { authMiddleware } from "../auth/auth.middleware.js";
import { roleMiddleware } from "../../middleware/role.middleware.js";
import orderRouter from "../order/order.route.js"
import { cancelOrder } from "../order/order.controller.js";
import { submitComplaint,myComplaints } from "../complaints/complaints.controller.js";
import { getCustomerProfile, updateCustomerProfile } from "./customer.controller.js";

const router = express.Router();

router.use(authMiddleware)
router.use(roleMiddleware("CUSTOMER"))

router.get("/profile", getCustomerProfile)
router.patch("/profile", updateCustomerProfile)

//order 
router.use("/orders", orderRouter);
router.patch("/orders/:orderID/cancel",cancelOrder)

//complaints
router.post("/complaints",      submitComplaint);
router.get("/complaints/my",    myComplaints);


export default router;
