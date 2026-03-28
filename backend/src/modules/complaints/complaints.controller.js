import asyncHandler from "../../utils/asyncHandler.js";
import { prisma } from "../../config/db.config.js";
import { sendNotification } from "../../utils/notification.js";
import {
  createComplaint,
  getMyComplaints,          // ← correct service function
  getComplaintsService,
  resolveComplaintService,
} from "./complaints.service.js";  // ← import from service, not admin controller

export const submitComplaint = asyncHandler(async (req, res) => {
  const complaint = await createComplaint(req.user.userID, req.user.role, req.body);

  const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
  await Promise.allSettled(
    admins.map((admin) =>
      sendNotification(
        admin.userID,
        "COMPLAINT",
        `A ${req.user.role.toLowerCase()} filed a complaint for order #${complaint.orderID}`,
        complaint.orderID,
      )
    )
  );

  res.status(201).json({ status: "success", data: complaint });
});

export const myComplaints = asyncHandler(async (req, res) => {
  const data = await getMyComplaints(req.user.userID);  // ← correct
  res.json({ status: "success", data });
});

// these are used by admin.controller.js
export const listComplaints = asyncHandler(async (req, res) => {
  const data = await getComplaintsService(req.query);
  res.json({ status: "success", ...data });
});

export const handleComplaint = asyncHandler(async (req, res) => {
  const complaint = await resolveComplaintService(parseInt(req.params.id), req.body);

  // notify the user who filed it
  await sendNotification(
    complaint.filedByUserID,
    "COMPLAINT",
    `Your complaint for order #${complaint.orderID} has been ${complaint.status.toLowerCase()}`,
    complaint.orderID,
  );

  res.json({ status: "success", data: complaint });
});