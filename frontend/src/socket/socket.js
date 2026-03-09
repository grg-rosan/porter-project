import { io } from "socket.io-client"  // ✅ frontend package

const socket = io(import.meta.env.VITE_BASE_URL, {
    autoConnect: false,
    withCredentials: true,
})

export default socket
