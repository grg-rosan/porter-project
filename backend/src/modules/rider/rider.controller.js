import { historyService } from "../../utils/historyService.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  getRiderProfileService,
  submitDocsService,
  updateAvailabilityService,
  updateRiderProfileService,
} from "./rider.service.js";
import AppError from "../../utils/AppError.js";

export const getRiderProfile = asyncHandler(async (req, res) => {
  const profile = await getRiderProfileService(req.user.userID);
  res.json({ status: "success", data: profile });
});

// ─── NEW ──────────────────────────────────────────────────────────────────────
export const updateRiderProfile = asyncHandler(async (req, res) => {
  // file is optional — multer puts a single upload under req.file
  const profile = await updateRiderProfileService(
    req.user.userID,
    req.body,
    req.file ?? null
  );
  res.json({ status: "success", data: profile });
});

// ─── FIX: now rejects unverified riders going online ──────────────────────────
export const updateAvailability = asyncHandler(async (req, res) => {
  const { isAvailable } = req.body;
  const profile = await updateAvailabilityService(req.user.userID, isAvailable);
  res.json({ status: "success", data: profile });
});

export const tripHistory = asyncHandler(async (req, res) => {
  const { userID, role } = req.user;
  const { filter } = req.query;
  const orders = await historyService(userID, role, filter);
  res.json({ status: "success", count: orders.length, data: orders });
});

export const submitDocs = asyncHandler(async (req, res) => {
  const { license, governmentID, vehicle_img } = req.files;
  if (!license || !governmentID || !vehicle_img) {
    throw new AppError("All documents are required", 400);
  }

  // FIX: pass req.user.userID (not req.user.id) to match auth middleware
  const rider = await submitDocsService(req.user.userID, req.files);
  res.status(200).json({ status: "success", data: rider });
});