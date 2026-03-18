import { useEffect } from "react"
import { useSocket } from "../context/SocketContext"
const useCustomerOrderSocket = ({ setStatus, setCurrentOrder, setRiderLocation, setSheetOpen }) => {
    const { socket } = useSocket()

    useEffect(() => {
        socket.on("order:accepted", ({ riderID }) => {
            setStatus("accepted")
            setCurrentOrder(prev => ({ ...prev, riderID }))
        })

        socket.on("rider:location:update", ({ lat, lng }) => {
            setRiderLocation({ lat, lng })
        })

        socket.on("order:status:update", ({ status }) => {
            setStatus(status)
            if (status === "delivered") {
                setCurrentOrder(null)
                setRiderLocation(null)
                setSheetOpen(false)
            }
        })

        socket.on("order:cancelled", () => {
            setStatus("idle")
            setCurrentOrder(null)
            setSheetOpen(false)
        })

        return () => {
            socket.off("order:accepted")
            socket.off("rider:location:update")
            socket.off("order:status:update")
            socket.off("order:cancelled")
        }
    }, [socket,setStatus, setCurrentOrder, setRiderLocation, setSheetOpen])
}

export default useCustomerOrderSocket