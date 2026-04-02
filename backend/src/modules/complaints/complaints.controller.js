// complaints.controller.js
import asyncHandler from "../../utils/asyncHandler.js";
import { prisma } from "../../config/db.config.js";
import { sendNotification } from "../../utils/notification.js";
import {
  createComplaint,
  getMyComplaints,          // ← correct service function
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
