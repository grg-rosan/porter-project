// hooks/useRiderOrder.js
import { useState, useCallback } from "react";
import { useOrderSocket } from "./useOrderSocket";

const parseLocation = (loc) => {
    if (!loc) return null;
    if (typeof loc === "string") {
        try { return JSON.parse(loc); } catch { return null; }
    }
    return loc;
};

export const useRiderOrder = () => {
    const [order,     setOrder]     = useState(null);
    const [jobStatus, setJobStatus] = useState(null);

    const { acceptOrder, rejectOrder, updateJobStatus, emitLocation, setAvailability } =
        useOrderSocket("rider", {
            onNewOrder: (data) => {
                setOrder({
                    ...data,
                    pickupLoc: parseLocation(data.pickup),
                    dropLoc:   parseLocation(data.dropoff),
                });
                setJobStatus("incoming");
            },
            onOrderCancelled: () => {
                setOrder(null);
                setJobStatus(null);
            },
            onAcceptConfirmed: (data) => {
                console.log("Order confirmed:", data.orderID);
            },
        });

    const handleAccept = useCallback(() => {
        if (!order) return;
        acceptOrder(order.orderID);
        setJobStatus("accepted");
    }, [order, acceptOrder]);

    const handleReject = useCallback(() => {
        if (!order) return;
        rejectOrder(order.orderID);
        setOrder(null);
        setJobStatus(null);
    }, [order, rejectOrder]);

    const handleStatusUpdate = useCallback((status) => {
        if (!order) return;
        updateJobStatus(order.orderID, status);
        setJobStatus(status);
        if (status === "delivered") {
            setOrder(null);
            setJobStatus(null);
        }
    }, [order, updateJobStatus]);

    return {
        order,
        jobStatus,
        handleAccept,
        handleReject,
        handleStatusUpdate,
        emitLocation,
        setAvailability,
    };
};