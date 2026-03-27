import socket from "../socket/socket";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);

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

        return () => {
            socket.off();
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
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);