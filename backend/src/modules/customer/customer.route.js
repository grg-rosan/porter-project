import express from "express";
import { authMiddleware } from "../auth/auth.middleware.js";
import { roleMiddleware } from "../../shared/middleware/rolemiddleware.js";
import orderRouter from "../order/order.route.js"

const router = express.Router();

router.use(authMiddleware)
router.use(roleMiddleware("CUSTOMER"))

//customer routes
router.use("/orders",orderRouter);

export default router;
