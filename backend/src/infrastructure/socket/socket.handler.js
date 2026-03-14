import jwt from "jsonwebtoken";
import cookie from "cookie";
import { prisma } from "../../config/db.config.js";

export const initSocketHandlers = (io) => {
  // ─── AUTH MIDDLEWARE ─────────────────────────────────────────
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
    } catch (error) {
      return next(new Error("Invalid token"));
    }
  });

  // ─── CONNECTION ──────────────────────────────────────────────
  io.on("connection", (socket) => {
    console.log(`Connected: ${socket.user.name} |${socket.userID} |(${socket.id})`);

    // ─── JOIN ROOM ───────────────────────────────────────────
    socket.on("user:join", async ({ role }) => {
    console.log("-----user:join----")
    socket.join(`user:${socket.userID}`)  // clean room name
    console.log(`👤 ${socket.user.name} | userID: ${socket.userID} | role: ${role} | room: user:${socket.userID}`)

      if (role === "RIDER") {
        const riderProfile = await prisma.riderProfile.findUnique({
          where: { userID: socket.userID },
          select: { vehicle_type: true, isAvailable: true },
        });

        if (riderProfile?.isAvailable) {
          socket.join("online_riders");
          socket.join(`riders:${riderProfile.vehicle_type}`);
          console.log(
            `🛵 Rider auto joined: riders:${riderProfile.vehicle_type}`,
          );
        }
      }
    });

    // ─── RIDER ONLINE ────────────────────────────────────────
    socket.on("rider:online", async () => {
      try {
        const riderProfile = await prisma.riderProfile.findUnique({
          where: { userID: socket.userID },
          select: { vehicle_type: true },
        });

        if (riderProfile) {
          console.log("----riders:online----")
          socket.join("online_riders");
          socket.join(`riders:${riderProfile.vehicle_type}: name: ${socket.user.name}`);
          console.log(`🟢 Rider online: riders:${riderProfile.vehicle_type}`);
        }
      } catch (error) {
        console.error("rider:online error:", error.message);
      }
    });

    // ─── RIDER OFFLINE ───────────────────────────────────────
    socket.on("rider:offline", async () => {
      try {
        const riderProfile = await prisma.riderProfile.findUnique({
          where: { userID: socket.userID },
          select: { vehicle_type: true },
        });

        if (riderProfile) {
          socket.leave("online_riders");
          socket.leave(`riders:${riderProfile.vehicle_type}`);
          console.log(`⚫ Rider offline: riders:${riderProfile.vehicle_type}`);
        }
      } catch (error) {
        console.error("rider:offline error:", error.message);
      }
    });

    // ─── RIDER ACCEPT ORDER — first accept wins ───────────────
    socket.on("order:accept", async ({ orderID, customerID }) => {
      try {
        // atomic update — only succeeds if order is still PENDING
        const result = await prisma.order.updateMany({
          where: {
            ID: orderID,
            riderID: null,
            order_status: "PENDING",
          },
          data: {
            order_status: "ASSIGNED",
            riderID: socket.userID,
          },
        });

        // count = 0 means another rider already accepted
        if (result.count === 0) {
          socket.emit("order:already_taken", {
            orderID,
            message: "Sorry, order was already accepted by another rider",
          });
          return;
        }
        // ✅ fetch full order to send back to rider
        const order = await prisma.order.findUnique({
          where: { ID: orderID },
        });

        // notify rider
        socket.emit("order:accept_confirmed", {
          orderID,
          order,
          message: "You have accepted the order",
        });

        // notify customer
        io.to(`user:${customerID}`).emit("order:accepted", {
          orderID,
          riderID: socket.userID,
          message: "Your order has been accepted",
        });

        // this rider won — get vehicle type
        const riderProfile = await prisma.riderProfile.findUnique({
          where: { userID: socket.userID },
          select: { vehicle_type: true },
        });

        // leave available pools — rider is now busy
        socket.leave("online_riders");
        socket.leave(`riders:${riderProfile.vehicle_type}`);
        socket.join(`order:${orderID}`);

        // notify other riders — remove order card from their UI
        io.to(`riders:${riderProfile.vehicle_type}`).emit("order:taken", {
          orderID,
          message: "Order taken by another rider",
        });

        console.log(`✅ Rider ${socket.userID} won order ${orderID}`);
      } catch (error) {
        console.error("order:accept error:", error.message);
        socket.emit("error", { message: "Failed to accept order" });
      }
    });

    // ─── RIDER REJECT ORDER ──────────────────────────────────
    socket.on("order:reject", ({ orderID, customerID }) => {
      io.to(`user:${customerID}`).emit("order:rejected", {
        orderID,
        message: "Rider rejected the order, finding another rider...",
      });
      console.log(`❌ Rider ${socket.userID} rejected order ${orderID}`);
    });

    // ─── RIDER LIVE LOCATION ─────────────────────────────────
    socket.on("rider:location", ({ lat, lng, customerID, orderID }) => {
      io.to(`user:${customerID}`).emit("rider:location:update", {
        lat,
        lng,
        orderID,
      });
    });

    // ─── JOB STATUS UPDATE ───────────────────────────────────
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

        // delivered — rider goes back to available pool
        if (status === "delivered") {
          const riderProfile = await prisma.riderProfile.findUnique({
            where: { userID: socket.userID },
            select: { vehicle_type: true },
          });

          socket.join("online_riders");
          socket.join(`riders:${riderProfile.vehicle_type}`);
          socket.leave(`order:${orderID}`);

          console.log(`✅ Order ${orderID} delivered — rider back online`);
        }

        console.log(`📦 Order ${orderID} status: ${status}`);
      } catch (error) {
        console.error("job:status error:", error.message);
        socket.emit("error", { message: "Failed to update status" });
      }
    });

    // ─── CUSTOMER CANCEL ORDER ───────────────────────────────
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
        }

        console.log(`🚫 Order ${orderID} cancelled`);
      } catch (error) {
        console.error("order:cancel error:", error.message);
        socket.emit("error", { message: "Failed to cancel order" });
      }
    });

    // ─── CHAT ────────────────────────────────────────────────
    socket.on("chat:message", ({ orderID, toUserID, message }) => {
      io.to(`user:${toUserID}`).emit("chat:message", {
        from: socket.userID,
        message,
        orderID,
        timestamp: new Date(),
      });
    });

    // ─── DISCONNECT ──────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`❌ Disconnected: ${socket.userID}`);
      // rooms auto cleared on disconnect
    });
  });
};

// ─── HELPERS ─────────────────────────────────────────────
const getStatusMessage = (status) => {
  const messages = {
    arrived: "Your rider has arrived at pickup location",
    picked_up: "Your order has been picked up",
    delivered: "Your order has been delivered",
  };
  return messages[status] || "Status updated";
};
