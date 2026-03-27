import { useEffect, useRef, useCallback } from "react"
import { useSocket } from "../context/SocketContext"

export const useOrderSocket = (role, handlers = {}) => {
    const { socket } = useSocket()
    const handlersRef = useRef(handlers)

    // keep ref in sync with latest handlers without triggering re-renders
    useEffect(() => {
        handlersRef.current = handlers
    })  // ← no dep array, runs every render to stay fresh

    useEffect(() => {
        if (!socket) return

        if (role === "rider") {
            socket.on("order:new",       (data) => handlersRef.current.onNewOrder?.(data))
            socket.on("order:cancelled", (data) => handlersRef.current.onOrderCancelled?.(data))
        }

        if (role === "customer") {
            socket.on("rider:location",  (data) => handlersRef.current.onRiderLocation?.(data))
            socket.on("order:accepted",  (data) => handlersRef.current.onOrderAccepted?.(data))
            socket.on("order:rejected",  (data) => handlersRef.current.onOrderRejected?.(data))
            socket.on("job:status",      (data) => handlersRef.current.onJobStatus?.(data))
        }

        return () => {
            socket.off("order:new")
            socket.off("order:cancelled")
            socket.off("rider:location")
            socket.off("order:accepted")
            socket.off("order:rejected")
            socket.off("job:status")
        }
    }, [socket, role]) // ← stable deps only, handlers intentionally excluded

    const acceptOrder = useCallback((orderID, customerID) => {
        socket.emit("order:accept", { orderID, customerID })
    }, [socket])

    const rejectOrder = useCallback((orderID, customerID) => {
        socket.emit("order:reject", { orderID, customerID })
    }, [socket])

    const updateJobStatus = useCallback((orderID, customerID, status) => {
        socket.emit("job:status", { orderID, customerID, status })
    }, [socket])

    const emitLocation = useCallback((location, customerID, orderID) => {
        socket.emit("rider:location", { ...location, customerID, orderID })
    }, [socket])

    const setAvailability = useCallback((isAvailable) => {
        socket.emit(isAvailable ? "rider:online" : "rider:offline")
    }, [socket])

    const placeOrder = useCallback((orderData) => {
        socket.emit("order:place", orderData)
    }, [socket])

    const cancelOrder = useCallback((orderID, riderID) => {
        socket.emit("order:cancel", { orderID, riderID })
    }, [socket])

    return {
        acceptOrder,
        rejectOrder,
        updateJobStatus,
        emitLocation,
        setAvailability,
        placeOrder,
        cancelOrder,
    }
}