import express from "express"
import { authMiddleware } from "../auth/auth.middleware.js"
import { roleMiddleware } from "../../shared/middleware/role.middleware.js"
import {
  getDashboardStats,
  getPendingDocs,
  getRiderVerifications,
  getRiderDetails,
  reviewDocs,
  getAnalytics,
  blockUser,
  unblockUser,
} from "./admin.controller.js"
import {listComplaints,handleComplaint} from "../complaints/complaints.controller.js"

const router = express.Router()

router.use(authMiddleware)
router.use(roleMiddleware("ADMIN"))

// dashboard
router.get("/dashboard", getDashboardStats)

// analytics
router.get("/analytics",getAnalytics)

// verification
router.get("/verifications",      getRiderVerifications)   // ?status=PENDING|VERIFIED|REJECTED
router.get("/verifications/docs", getPendingDocs)
router.get("/verifications/:riderID",        getRiderDetails)
router.patch("/verifications/:riderID/review", reviewDocs)

// complaints
router.get("/complaints", listComplaints);
router.patch("/:id/resolve", handleComplaint);

// user management
router.patch("/users/:userID/block",         blockUser)
router.patch("/users/:userID/unblock",       unblockUser)

// admin.routes.js
router.get("/fare-config",                getFareConfigs);
router.patch("/fare-config/:vehicleType", updateFareConfig);

export default router