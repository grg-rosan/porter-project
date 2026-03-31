import express from "express"
import { authMiddleware } from "../auth/auth.middleware.js"
import { roleMiddleware } from "../../middleware"
import {
  getDashboardStats,
  getPendingDocs,
  getRiderVerifications,
  getRiderDetails,
  reviewDocs,
  getAnalytics,
  blockUser,
  unblockUser,
  getFareConfigs,
  updateFareConfig,
  getSurgeStatus, 
  updateSurge 
} from "./admin.controller.js"
import { getComplaints,resolveComplaint  } from "./admin.controller.js"
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
router.get("/complaints", getComplaints);
router.patch("/complaints/:id/resolve", resolveComplaint);

// user management
router.patch("/users/:userID/block",         blockUser)
router.patch("/users/:userID/unblock",       unblockUser)

// vehicle fare
router.get("/fare-config",                getFareConfigs);
router.patch("/fare-config/:vehicleType", updateFareConfig);

router.get("/surge",   getSurgeStatus);
router.patch("/surge", updateSurge);
export default router


{/**
  **How admin handles complaints — full flow:**
```
GET  /api/v1/admin/complaints              → list all with pagination
GET  /api/v1/admin/complaints?status=OPEN  → filter by status
PATCH /api/v1/admin/complaints/:id/resolve → resolve or dismiss
  */}