import { useEffect, useRef, useCallback } from "react";
import { useSocket } from "../context/SocketContext";

export const useOrderSocket = (role, handlers = {}) => {
  const { socket } = useSocket();
  const handlersRef = useRef(handlers);

  // keep ref in sync with latest handlers without triggering re-renders
  useEffect(() => {
    handlersRef.current = handlers;
  }); // ← no dep array, runs every render to stay fresh

  useEffect(() => {
    if (!socket) return;

    if (role === "rider") {
      socket.on("order:new", (data) => handlersRef.current.onNewOrder?.(data));
      socket.on("order:cancelled", (data) =>
        handlersRef.current.onOrderCancelled?.(data),
      );
    }

    if (role === "customer") {
      socket.on("rider:location", (data) =>
        handlersRef.current.onRiderLocation?.(data),
      );
      // ✅ This maps the generic "notification" event to your specific UI handlers
      // Inside useOrderSocket.js role === "customer" block
      socket.on("notification", (data) => {
        if (data.type === "ORDER_ASSIGNED") {
          // We call the handler and pass the riderID we just added to the backend emit
          handlersRef.current.onOrderAccepted?.({
            orderID: data.orderID,
            riderID: data.riderID, // ✅ This will now contain riderProfile.riderID
            message: data.message,
          });
        }

        if (data.type.startsWith("ORDER_") && data.type !== "ORDER_PLACED") {
          const statusMapping = {
            ORDER_ASSIGNED: "accepted",
            ORDER_ARRIVED: "arrived",
            ORDER_PICKED_UP: "picked_up",
            ORDER_DELIVERED: "delivered",
            ORDER_CANCELLED: "cancelled",
          };

          handlersRef.current.onJobStatus?.({
            status: statusMapping[data.type] || "accepted",
            orderID: data.orderID,
          });
        }
      });
      socket.on("order:accepted", (data) =>
        handlersRef.current.onOrderAccepted?.(data),
      );
      socket.on("order:rejected", (data) =>
        handlersRef.current.onOrderRejected?.(data),
      );
      socket.on("job:status", (data) =>
        handlersRef.current.onJobStatus?.(data),
      );
    }

    return () => {
      socket.off("order:new");
      socket.off("order:cancelled");
      socket.off("rider:location");
      socket.off("order:accepted");
      socket.off("order:rejected");
      socket.off("job:status");
      socket.off("notification");
    };
  }, [socket, role]); // ← stable deps only, handlers intentionally excluded

  const acceptOrder = useCallback(
    (orderID, customerID) => {
      socket.emit("order:accept", { orderID, customerID });
    },
    [socket],
  );

  const rejectOrder = useCallback(
    (orderID, customerID) => {
      socket.emit("order:reject", { orderID, customerID });
    },
    [socket],
  );

  const updateJobStatus = useCallback(
    (orderID, customerID, status) => {
      socket.emit("job:status", { orderID, customerID, status });
    },
    [socket],
  );

  const emitLocation = useCallback(
    (location, customerID, orderID) => {
      socket.emit("rider:location", { ...location, customerID, orderID });
    },
    [socket],
  );

  const setAvailability = useCallback(
    (isAvailable) => {
      socket.emit(isAvailable ? "rider:online" : "rider:offline");
    },
    [socket],
  );

  const placeOrder = useCallback(
    (orderData) => {
      socket.emit("order:place", orderData);
    },
    [socket],
  );

  const cancelOrder = useCallback(
    (orderID, riderID) => {
      socket.emit("order:cancel", { orderID, riderID });
    },
    [socket],
  );

  return {
    acceptOrder,
    rejectOrder,
    updateJobStatus,
    emitLocation,
    setAvailability,
    placeOrder,
    cancelOrder,
  };
};
