import express from "express";
import { authMiddleware } from "../auth/auth.middleware.js";
import { roleMiddleware } from "../auth/role.middleware.js";
import { myComplaints, submitComplaint } from "./complaints.controller.js";

const router = express.Router();

router.use(authMiddleware);

// customer & rider routes
router.post("/",     roleMiddleware("CUSTOMER", "RIDER"), submitComplaint);
router.get("/my",    roleMiddleware("CUSTOMER", "RIDER"), myComplaints);

// admin routes
    

export default router;