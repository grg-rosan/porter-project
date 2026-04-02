// utils/notification.js
import { prisma } from "../config/db.config.js";
import { getIO }  from "../infrastructure/socket/socket.handler.js";

export const sendNotification = async (userID, type, message, orderID = null,) => {
  // 1. save to DB — user sees it later even if offline
  const notification = await prisma.notification.create({
    data: { userID, type, message, orderID },
  });

  // 2. emit via socket — user sees it instantly if online
  getIO().to(`user:${userID}`).emit("notification", {
    id:        notification.ID,
    type:      notification.type,
    message:   notification.message,
    orderID:   notification.orderID,
    createdAt: notification.createdAt,
  });

  return notification;
};