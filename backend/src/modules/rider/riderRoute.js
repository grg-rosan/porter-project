import express from "express"
import { authMiddleware } from "../auth/auth.middleware"
import { roleMiddleware } from "../../shared/middleware/rolemiddleware"
import { getRiderProfile, updateAvailability } from "./rider.controller"

const router = express.Router()

router.use(authMiddleware)
router.use(roleMiddleware("RIDER"))

// get rider profile
router.get("/profile", getRiderProfile)
// api/rider/profile

router.patch("/availability", updateAvailability)
// api/rider/availability

export default router