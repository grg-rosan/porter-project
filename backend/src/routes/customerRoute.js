import express from "express";
import createOrder from "../controllers/createOrderController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
import { roleMiddleware } from "../middleware/rolemiddleware.js";

const router = express.Router();

router.use(authMiddleware)

//customer routes
router.post("/create-order", roleMiddleware("CUSTOMER"),createOrder);

export default router;
