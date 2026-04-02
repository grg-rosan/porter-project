import socket from "../socket/socket";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [lastNotification, setLastNotification] = useState(null);

    // auto connect/disconnect based on auth state
    useEffect(() => {
        if (!user?.role) {
            socket.off();
            socket.disconnect();
            return;
        }

        socket.once("connect", () => {
            socket.emit("user:join", { role: user.role.toUpperCase() });
            console.log("emitted user:join:", user.role);
        });

        socket.connect();

        socket.on("notification", (data) => {
            console.log("New notification received:", data);
            setLastNotification(data);
            
            // OPTIONAL: If it's a status update, you might want to 
            // trigger a global state refresh or show a toast here.
            if (data.type === "ORDER_ASSIGNED") {
                // Logic to update the Order Status UI
            }
        });

        return () => {
            socket.off();
            socket.off("notification")
            socket.disconnect();
        };
    }, [user]);

    // status listeners
    useEffect(() => {
        socket.on("connect", () => setIsConnected(true));
        socket.on("disconnect", () => setIsConnected(false));
        socket.on("connect_error", (err) => console.error("socket error:", err.message));

        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off("connect_error");
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected, lastNotification }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);