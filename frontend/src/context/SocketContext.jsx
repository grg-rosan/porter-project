import socket  from "../socket/socket";
import {createContext, useContext, useEffect, useState} from "react"
import { useAuth } from "./AuthContext";



const SocketContext = createContext();

export const SocketProvider = ({children}) => {
    const [isConnected, setIsConnected] = useState(false);

    const {user, logout} = useAuth()

    const connectSocket = () =>{
        socket.connect()
    }

    const disconnectSocket = () => {
        socket.disconnect()
    }

    useEffect(()=>{
        socket.on("connect_error",(error) =>{
            console.log("socket error", error.message);
        })
        socket.on("connect", () => {
            console.log("socket connected:", socket.id)
            setIsConnected(true);
             if (user?.role) {
                socket.emit("user:join", { role: user.role })  // join room on connect
            }
        })

        socket.on("disconnect",()=>{
            console.log("socket disconnected")
            setIsConnected(false)
        })
        return ()=>{
            socket.off("connect")
            socket.off("disconnect")
            socket.off('connect_error')
        }
    },[]);

    return(
        <SocketContext.Provider value= {{socket, isConnected,connectSocket,disconnectSocket}}>
            {children}
        </SocketContext.Provider>
    )
}
export const useSocket = () => useContext(SocketContext)