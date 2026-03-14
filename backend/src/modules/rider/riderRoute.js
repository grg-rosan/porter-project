import express from "express"
import { authMiddleware } from "../auth/auth.middleware.js"
import { roleMiddleware } from "../../shared/middleware/rolemiddleware.js"
import { getRiderProfile, tripHistory, updateAvailability } from "./rider.controller.js"

const router = express.Router()

router.use(authMiddleware)
router.use(roleMiddleware("RIDER"))

// get rider profile
router.get("/profile", getRiderProfile)
// api/rider/profile

router.patch("/availability", updateAvailability)
// api/rider/availability

router.get("/trips/history",tripHistory)

export default router

// GET /api/trips/history             // all trips
// GET /api/trips/history?filter=daily
// GET /api/trips/history?filter=weekly
// GET /api/trips/history?filter=monthly