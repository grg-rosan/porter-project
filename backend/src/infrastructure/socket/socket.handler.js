import jwt from "jsonwebtoken";
import cookie from "cookie";
import { prisma } from "../../config/db.config.js";
import { sendNotification } from "../../utils/notification.js";

let io; // ✅ module-level

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};

export const initSocketHandlers = (socketIO) => {
  io = socketIO; // ✅ store reference

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
          socket.join(`riders:${riderProfile.vehicle_type}`); // ✅ clean room name
        }
      }
    });

    socket.on("rider:online", async () => {
      try {
        const riderProfile = await prisma.riderProfile.findUnique({
          where: { userID: socket.userID },
          select: { vehicle_type: true },
        });
        if (riderProfile) {
          socket.join("online_riders");
          socket.join(`riders:${riderProfile.vehicle_type}`); // ✅ fixed
        }
      } catch (err) {
        console.error("rider:online error:", err.message);
      }
    });

    socket.on("rider:offline", async () => {
      try {
        const riderProfile = await prisma.riderProfile.findUnique({
          where: { userID: socket.userID },
          select: { vehicle_type: true },
        });
        if (riderProfile) {
          socket.leave("online_riders");
          socket.leave(`riders:${riderProfile.vehicle_type}`);
        }
      } catch (err) {
        console.error("rider:offline error:", err.message);
      }
    });

    //orders status sockets
    socket.on("order:accept", async ({ orderID, customerID }) => {
      try {
        const riderProfile = await prisma.riderProfile.findUnique({
          where: { userID: socket.userID },
          select: { riderID: true, vehicle_type: true },
        });
        if (!riderProfile)
          return socket.emit("error", { message: "rider Profile not found" });
        const result = await prisma.order.updateMany({
          where: { ID: orderID, riderID: null, order_status: "PENDING" },
          data: { order_status: "ASSIGNED", riderID: riderProfile.riderID },
        });

        if (result.count === 0) {
          socket.emit("order:already_taken", {
            orderID,
            message: "Sorry, order was already accepted by another rider",
          });
          return;
        }
        const order = await prisma.order.findUnique({
          where: { ID: orderID },
          include: {
            customerProfile: { select: { userID: true } },
          },
        });
        if (!order) return socket.emit("error", { message: "Order not found" });

        socket.emit("order:accept_confirmed", {
          orderID,
          order,
          message: "You have accepted the order",
        });
        io.to(`user:${customerID}`).emit("order:accepted", {
          orderID,
          riderID: socket.userID,
          message: "Your order has been accepted",
        });

        // ✅ persist notification to DB as well
        await sendNotification(
          order.customerProfile.userID,
          "ORDER_ASSIGNED",
          "A rider has been assigned to your order",
          orderID,
        );
        socket.leave("online_riders");
        socket.leave(`riders:${riderProfile.vehicle_type}`);
        socket.join(`order:${orderID}`);

        io.to(`riders:${riderProfile.vehicle_type}`).emit("order:taken", {
          orderID,
          message: "Order taken by another rider",
        });
      } catch (err) {
        console.error("order:accept error:", err.message);
        socket.emit("error", { message: "Failed to accept order" });
      }
    });

    socket.on("order:reject", ({ orderID, customerID }) => {
      io.to(`user:${customerID}`).emit("order:rejected", {
        orderID,
        message: "Rider rejected the order, finding another rider...",
      });
    });

    socket.on("rider:location", ({ lat, lng, customerID, orderID }) => {
      io.to(`user:${customerID}`).emit("rider:location:update", {
        lat,
        lng,
        orderID,
      });
    });

    socket.on("job:status", async ({ orderID, customerID, status }) => {
      try {
        await prisma.order.update({
          where: { ID: orderID },
          data: { order_status: status.toUpperCase() },
        });

        io.to(`user:${customerID}`).emit("order:status:update", {
          orderID,
          status,
          message: getStatusMessage(status),
        });

        // ✅ persist notification to DB
        await sendNotification(
          customerID,
          `ORDER_${status.toUpperCase()}`,
          getStatusMessage(status),
          orderID,
        );

        if (status === "delivered") {
          const riderProfile = await prisma.riderProfile.findUnique({
            where: { userID: socket.userID },
            select: { vehicle_type: true },
          });
          socket.join("online_riders");
          socket.join(`riders:${riderProfile.vehicle_type}`);
          socket.leave(`order:${orderID}`);
        }
      } catch (err) {
        console.error("job:status error:", err.message);
        socket.emit("error", { message: "Failed to update status" });
      }
    });

    socket.on("order:cancel", async ({ orderID, riderID }) => {
      try {
        await prisma.order.update({
          where: { ID: orderID },
          data: { order_status: "CANCELLED" },
        });
        if (riderID) {
          io.to(`user:${riderID}`).emit("order:cancelled", {
            orderID,
            message: "Customer cancelled the order",
          });
          // ✅ persist notification
          await sendNotification(
            riderID,
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

    socket.on("chat:message", ({ orderID, toUserID, message }) => {
      io.to(`user:${toUserID}`).emit("chat:message", {
        from: socket.userID,
        message,
        orderID,
        timestamp: new Date(),
      });
    });

    socket.on("disconnect", () => {
      console.log(`❌ Disconnected: ${socket.userID}`);
    });
  });
};

const getStatusMessage = (status) => {
  const messages = {
    arrived: "Your rider has arrived at pickup location",
    picked_up: "Your order has been picked up",
    delivered: "Your order has been delivered",
  };
  return messages[status] || "Status updated";
};
