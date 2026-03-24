import socket from "../socket/socket";
import { createContext, useContext, useEffect, useState } from "react";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);

  // Socket listeners — set up once only, no dependencies
  useEffect(() => {
    socket.on("connect", () => {
      console.log("socket connected:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("socket disconnected");
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.log("socket error:", error.message);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, []);                              // ← empty, runs once

  // Pass user in so socket can emit user:join after connecting
  const connectSocket = (user) => {
    socket.connect();

    // if already connected by the time this runs, emit immediately
    if (socket.connected && user?.role) {
      socket.emit("user:join", { role: user.role.toUpperCase() });
      console.log("emitted user:join:", user.role);
    }
  };

  // emit user:join once socket confirms connection
  // this handles the case where connect event fires after connectSocket()
  const joinAsUser = (user) => {
    if (!user?.role) return;
    socket.emit("user:join", { role: user.role.toUpperCase() });
    console.log("emitted user:join:", user.role);
  };

  const disconnectSocket = () => {
    socket.disconnect();
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, connectSocket, joinAsUser, disconnectSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);