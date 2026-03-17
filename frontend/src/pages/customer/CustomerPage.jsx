import { useEffect, useState } from "react"
import { useSocket } from "../../context/SocketContext"
import OrderFormComp from "./customerComps/OrderFormComp"
import OrderStatus from "./customerComps/OrderStatus"
import { getAPI } from "../../api/api"
import TrackingMap from "../../components/sharedComps/TrackingMap"

const CustomerPage = () => {
    const { socket } = useSocket()
    const [status, setStatus] = useState("idle")
    const [riderLocation, setRiderLocation] = useState(null)
    const [currentOrder, setCurrentOrder] = useState(null)

    useEffect(() => {
        socket.on("order:accepted", ({ riderID }) => {
            setStatus("accepted")
            setCurrentOrder(prev => ({ ...prev, riderID }))
        })

        socket.on("rider:location:update", ({ lat, lng }) => {
            console.log("📍 rider location:", lat, lng)  // debug
            setRiderLocation({ lat, lng })
        })

        socket.on("order:status:update", ({ status }) => {
            setStatus(status)
            if (status === "delivered") {
                setCurrentOrder(null)
                setRiderLocation(null)
            }
        })

        socket.on("order:cancelled", () => {
            setStatus("cancelled")
            setCurrentOrder(null)
        })

        return () => {
            socket.off("order:accepted")
            socket.off("rider:location:update")
            socket.off("order:status:update")
            socket.off("order:cancelled")
        }
    }, [socket])

    const handleOrderRequest = async (formData) => {
        console.log("submitting order:", formData) 
        const data = await getAPI("customer/orders/create", "POST", formData)
          console.log("order response:", data) 
        if (data.order) {
            const order = {...data.order, 
                pickupLoc : JSON.parse(data.order.pickup_address),
                dropLoc : JSON.parse(data.order.drop_address)
                
            }
            setCurrentOrder(order)
            setStatus("pending")
            console.log("status set to pending")
        }
    }

    const handleCancelOrder = () => {
        socket.emit("order:cancel", {
            orderID: currentOrder.ID,
            riderID: currentOrder.riderID
        })
        setStatus("cancelled")
        setCurrentOrder(null)
    }
    return (
        <div className="p-4">
            {status === "idle" || status === "cancelled" ? (
                <OrderFormComp onSubmit={handleOrderRequest} />
            ) : (
                <div className="space-y-4">
                    <OrderStatus status={status} />

                    {/* ✅ only one map component */}
                    <TrackingMap
                        riderLocation={riderLocation}
                        pickupLocation={currentOrder?.pickupLoc}
                    />

                    {(status === "pending" || status === "accepted") && (
                        <button
                            onClick={handleCancelOrder}
                            className="w-full bg-red-500 text-white p-2 rounded"
                        >
                            Cancel Order
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default CustomerPage