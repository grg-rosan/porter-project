// hooks/useRiderMap.js
import { useState, useMemo, useEffect, useCallback } from "react";

export const useRiderMap = ({ order, jobStatus, onLocationEmit }) => {
    const [myLocation, setMyLocation] = useState(null);

    // ── emit location every 5s once job is active ─────────────────
    useEffect(() => {
        if (!order || jobStatus === "incoming" || jobStatus === null) return;

        const interval = setInterval(() => {
            navigator.geolocation.getCurrentPosition(
                ({ coords }) => {
                    const location = { lat: coords.latitude, lng: coords.longitude };
                    setMyLocation(location);
                    onLocationEmit(location, order.orderID);
                },
                (err) => console.error("Geolocation error:", err),
                { enableHighAccuracy: true }
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [order, jobStatus, onLocationEmit]);

    // reset location when order ends
    useEffect(() => {
        if (!order) setMyLocation(null);
    }, [order]);

    // ── which markers to show based on job stage ──────────────────
    const pickupLocation = useMemo(() => {
        if (!order?.pickupLoc) return null;
        // hide pickup once parcel is collected
        if (jobStatus === "picked_up" || jobStatus === "delivered") return null;
        return order.pickupLoc;
    }, [order, jobStatus]);

    const dropLocation = useMemo(() => {
        if (!order?.dropLoc) return null;
        // only show drop after parcel is collected
        if (jobStatus !== "picked_up" && jobStatus !== "delivered") return null;
        return order.dropLoc;
    }, [order, jobStatus]);

    // ── map label based on current stage ─────────────────────────
    const mapLabel = useMemo(() => {
        const labels = {
            incoming:  "New order incoming",
            accepted:  "Head to pickup location",
            arrived:   "You have arrived at pickup",
            picked_up: "Head to drop location",
            delivered: "Order delivered",
        };
        return labels[jobStatus] ?? null;
    }, [jobStatus]);

    return { myLocation, pickupLocation, dropLocation, mapLabel };
};