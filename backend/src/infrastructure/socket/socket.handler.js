import jwt from "jsonwebtoken";
import cookie from "cookie";
import { prisma } from "../../config/db.config.js";
import { sendNotification } from "../../utils/notification.js";

let io;

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};

export const initSocketHandlers = (socketIO) => {
  io = socketIO;

  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const token = cookies.token;
      if (!token) return next(new Error("No token provided"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { userID: decoded.id },
        select: { userID: true, role: true, name: true },
      });
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      socket.userID = user.userID;
      next();
    } catch {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Connected: ${socket.user.name} | ${socket.userID}`);

    // ── user:join ─────────────────────────────────────────────────
    socket.on("user:join", async ({ role }) => {
      socket.join(`user:${socket.userID}`);
      console.log(`👤 ${socket.user.name} joined room: user:${socket.userID}`);

      if (role === "RIDER") {
        const riderProfile = await prisma.riderProfile.findUnique({
          where: { userID: socket.userID },
          select: { vehicle_type: true, isAvailable: true },
        });
        if (riderProfile?.isAvailable) {
          socket.join("online_riders");
          socket.join(`riders:${riderProfile.vehicle_type}`);
          console.log(`🛵 ${socket.user.name} joined riders:${riderProfile.vehicle_type}`);
        }
      }
    });

    // ── rider:online ──────────────────────────────────────────────
    socket.on("rider:online", async () => {
      try {
        const riderProfile = await prisma.riderProfile.findUnique({
          where: { userID: socket.userID },
          select: { vehicle_type: true },
        });
        if (riderProfile) {
          socket.join("online_riders");
          socket.join(`riders:${riderProfile.vehicle_type}`);
          console.log(`🟢 ${socket.user.name} is online → riders:${riderProfile.vehicle_type}`);
        }
      } catch (err) {
        console.error("rider:online error:", err.message);
      }
    });

    // ── rider:offline ─────────────────────────────────────────────
    socket.on("rider:offline", async () => {
      try {
        const riderProfile = await prisma.riderProfile.findUnique({
          where: { userID: socket.userID },
          select: { vehicle_type: true },
        });
        if (riderProfile) {
          socket.leave("online_riders");
          socket.leave(`riders:${riderProfile.vehicle_type}`);
          console.log(`⚫ ${socket.user.name} is offline`);
        }
      } catch (err) {
        console.error("rider:offline error:", err.message);
      }
    });

    // ── order:accept ──────────────────────────────────────────────
    socket.on("order:accept", async ({ orderID }) => {
      try {
        const riderProfile = await prisma.riderProfile.findUnique({
          where: { userID: socket.userID },
          select: { riderID: true, vehicle_type: true },
        });
        if (!riderProfile)
          return socket.emit("error", { message: "Rider profile not found" });

        // atomic update — prevents race condition
        const result = await prisma.order.updateMany({
          where: { ID: orderID, riderID: null, order_status: "PENDING" },
          data: { order_status: "ASSIGNED", riderID: riderProfile.riderID },
        });

        if (result.count === 0) {
          return socket.emit("order:already_taken", {
            orderID,
            message: "Sorry, order was already accepted by another rider",
          });
        }

        // fetch order with customer's userID from DB — never trust frontend
        const order = await prisma.order.findUnique({
          where: { ID: orderID },
          include: {
            customerProfile: { select: { userID: true } },
          },
        });
        if (!order) return socket.emit("error", { message: "Order not found" });

        const customerUserID = order.customerProfile.userID; // ✅ from DB

        socket.emit("order:accept_confirmed", {
          orderID,
          message: "You have accepted the order",
        });

        // ✅ use customerUserID from DB, not from frontend payload
        io.to(`user:${customerUserID}`).emit("order:accepted", {
          orderID,
          riderUserID: socket.userID,
          message: "Your order has been accepted",
        });

        await sendNotification(
          customerUserID,
          "ORDER_ASSIGNED",
          "A rider has been assigned to your order",
          orderID,
        );

        // notify other riders this order is gone
        io.to(`riders:${riderProfile.vehicle_type}`).emit("order:taken", {
          orderID,
          message: "Order taken by another rider",
        });

        socket.leave("online_riders");
        socket.leave(`riders:${riderProfile.vehicle_type}`);
        socket.join(`order:${orderID}`);
      } catch (err) {
        console.error("order:accept error:", err.message);
        socket.emit("error", { message: "Failed to accept order" });
      }
    });

    // ── order:reject ──────────────────────────────────────────────
    socket.on("order:reject", async ({ orderID }) => {
      try {
        // fetch customerUserID from DB
        const order = await prisma.order.findUnique({
          where: { ID: orderID },
          include: { customerProfile: { select: { userID: true } } },
        });
        if (!order) return;

        io.to(`user:${order.customerProfile.userID}`).emit("order:rejected", {
          orderID,
          message: "Rider rejected the order, finding another rider...",
        });
      } catch (err) {
        console.error("order:reject error:", err.message);
      }
    });

    // ── rider:location ────────────────────────────────────────────
    socket.on("rider:location", async ({ lat, lng, orderID }) => {
      try {
        // fetch customerUserID from DB via order
        const order = await prisma.order.findUnique({
          where: { ID: orderID },
          include: { customerProfile: { select: { userID: true } } },
        });
        if (!order) return;

        io.to(`user:${order.customerProfile.userID}`).emit("rider:location:update", {
          lat,
          lng,
          orderID,
        });
      } catch (err) {
        console.error("rider:location error:", err.message);
      }
    });

    // ── job:status ────────────────────────────────────────────────
    socket.on("job:status", async ({ orderID, status }) => {
      try {
        await prisma.order.update({
          where: { ID: orderID },
          data: { order_status: status.toUpperCase() },
        });

        // fetch customerUserID from DB
        const order = await prisma.order.findUnique({
          where: { ID: orderID },
          include: { customerProfile: { select: { userID: true } } },
        });
        if (!order) return;

        const customerUserID = order.customerProfile.userID; // ✅ from DB

        io.to(`user:${customerUserID}`).emit("order:status:update", {
          orderID,
          status,
          message: getStatusMessage(status),
        });

        await sendNotification(
          customerUserID,
          `ORDER_${status.toUpperCase()}`,
          getStatusMessage(status),
          orderID,
        );

        if (status === "delivered") {
          const riderProfile = await prisma.riderProfile.findUnique({
            where: { userID: socket.userID },
            select: { vehicle_type: true },
          });
          if (riderProfile) {
            socket.join("online_riders");
            socket.join(`riders:${riderProfile.vehicle_type}`);
          }
          socket.leave(`order:${orderID}`);
        }
      } catch (err) {
        console.error("job:status error:", err.message);
        socket.emit("error", { message: "Failed to update status" });
      }
    });

    // ── order:cancel ──────────────────────────────────────────────
    socket.on("order:cancel", async ({ orderID }) => {
      try {
        const order = await prisma.order.findUnique({
          where: { ID: orderID },
          include: {
            riderProfile: { select: { userID: true } },  // ✅ get rider's userID
          },
        });
        if (!order) return;

        await prisma.order.update({
          where: { ID: orderID },
          data: { order_status: "CANCELLED" },
        });

        if (order.riderProfile?.userID) {
          const riderUserID = order.riderProfile.userID; // ✅ userID not riderID
          io.to(`user:${riderUserID}`).emit("order:cancelled", {
            orderID,
            message: "Customer cancelled the order",
          });
          await sendNotification(
            riderUserID,
            "ORDER_CANCELLED",
            "Customer cancelled the order",
            orderID,
          );
        }
      } catch (err) {
        console.error("order:cancel error:", err.message);
        socket.emit("error", { message: "Failed to cancel order" });
      }
    });

    // ── chat:message ──────────────────────────────────────────────
    socket.on("chat:message", ({ orderID, toUserID, message }) => {
      io.to(`user:${toUserID}`).emit("chat:message", {
        from: socket.userID,
        message,
        orderID,
        timestamp: new Date(),
      });
    });

    // ── disconnect ────────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`❌ Disconnected: ${socket.user.name} | ${socket.userID}`);
    });
  });
};

const getStatusMessage = (status) => {
  const messages = {
    arrived:   "Your rider has arrived at pickup location",
    picked_up: "Your order has been picked up",
    delivered: "Your order has been delivered",
    cancelled: "Your order has been cancelled",
  };
  return messages[status] || "Status updated";
};