import socket from "../socket/socket";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [lastNotification, setLastNotification] = useState(null);

    // ── connection + room join ────────────────────────────────────
    useEffect(() => {
        if (!user?.role) {
            socket.disconnect();
            return;
        }

        const handleNotification = (data) => {
            console.log("New notification received:", data);
            setLastNotification(data);
        };

        const handleConnect = () => {
            socket.emit("user:join", { role: user.role.toUpperCase() });
            console.log("emitted user:join:", user.role);
        };

        socket.on("connect", handleConnect);
        socket.on("notification", handleNotification);

        socket.connect();

        // already connected (e.g. StrictMode remount) — emit immediately
        if (socket.connected) {
            socket.emit("user:join", { role: user.role.toUpperCase() });
        }

        return () => {
            socket.off("connect", handleConnect);
            socket.off("notification", handleNotification);
        };
    }, [user]);

    // ── connection status ─────────────────────────────────────────
    useEffect(() => {
        const handleConnect    = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);
        const handleError      = (err) => console.error("socket error:", err.message);

        // ✅ named functions so off() only removes these specific handlers
        socket.on("connect",       handleConnect);
        socket.on("disconnect",    handleDisconnect);
        socket.on("connect_error", handleError);

        return () => {
            socket.off("connect",       handleConnect);    // ✅ removes only this one
            socket.off("disconnect",    handleDisconnect);
            socket.off("connect_error", handleError);
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected, lastNotification }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);