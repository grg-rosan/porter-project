import { useEffect, useRef, useCallback } from "react";
import { useSocket } from "../context/SocketContext";

export const useOrderSocket = (role, handlers = {}) => {
  const { socket } = useSocket();
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!socket) return;

    if (role === "rider") {
      socket.on("order:new",        (data) => handlersRef.current.onNewOrder?.(data));
      socket.on("order:taken",      (data) => handlersRef.current.onOrderTaken?.(data));
      socket.on("order:cancelled",  (data) => handlersRef.current.onOrderCancelled?.(data));
      socket.on("order:accept_confirmed", (data) => handlersRef.current.onAcceptConfirmed?.(data));
    }

    if (role === "customer") {
      socket.on("order:accepted",      (data) => handlersRef.current.onOrderAccepted?.(data));
      socket.on("order:rejected",      (data) => handlersRef.current.onOrderRejected?.(data));
      socket.on("order:cancelled",     (data) => handlersRef.current.onOrderCancelled?.(data));
      socket.on("order:status:update", (data) => handlersRef.current.onJobStatus?.(data));       // ✅ matches backend
      socket.on("rider:location:update",(data) => handlersRef.current.onRiderLocation?.(data)); // ✅ matches backend
    }

    return () => {
      if (role === "rider") {
        socket.off("order:new");
        socket.off("order:taken");
        socket.off("order:cancelled");
        socket.off("order:accept_confirmed");
      }
      if (role === "customer") {
        socket.off("order:accepted");
        socket.off("order:rejected");
        socket.off("order:cancelled");
        socket.off("order:status:update");   // ✅
        socket.off("rider:location:update"); // ✅
      }
    };
  }, [socket, role]);

  // ── emitters ──────────────────────────────────────────────────

  const acceptOrder = useCallback((orderID) => {
    // ✅ no customerID — backend gets it from DB
    socket.emit("order:accept", { orderID });
  }, [socket]);

  const rejectOrder = useCallback((orderID) => {
    // ✅ no customerID — backend gets it from DB
    socket.emit("order:reject", { orderID });
  }, [socket]);

  const updateJobStatus = useCallback((orderID, status) => {
    // ✅ no customerID — backend gets it from DB
    socket.emit("job:status", { orderID, status });
  }, [socket]);

  const emitLocation = useCallback((location, orderID) => {
    // ✅ no customerID — backend gets it from DB via orderID
    socket.emit("rider:location", { ...location, orderID });
  }, [socket]);

  const setAvailability = useCallback((isAvailable) => {
    socket.emit(isAvailable ? "rider:online" : "rider:offline");
  }, [socket]);

  const cancelOrder = useCallback((orderID) => {
    // ✅ no riderID — backend gets it from DB
    socket.emit("order:cancel", { orderID });
  }, [socket]);

  return {
    acceptOrder,
    rejectOrder,
    updateJobStatus,
    emitLocation,
    setAvailability,
    cancelOrder,
  };
};