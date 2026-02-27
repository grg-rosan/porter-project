import express from "express";
import { authMiddleware } from "../middleware/authmiddleware.js";
import { roleMiddleware } from "../middleware/rolemiddleware.js";
// import { getOrderController } from "../controllers/getOrderController.js";

const router = express.Router();

router.use(authMiddleware)

//rider routes
// router.get('/',roleMiddleware("RIDER"),getOrderController)


export default router;
