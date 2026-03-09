import { useEffect, useState } from "react"
import { useSocket } from "../../context/SocketContext"
import OrderCard from "./riderComps/OrderCard"
import JobControls from "./riderComps/JobControls"
import TrackingMap from "../../components/sharedComps/TrackingMap"
import { getAPI } from "../../api/api"

const RiderPage = () => {
    const { socket } = useSocket()
    const [order, setOrder] = useState(null)
    const [jobStatus, setJobStatus] = useState(null)
    const [myLocation, setMyLocation] = useState(null)
    const [profile, setProfile] = useState(null)
    const [isAvailable, setIsAvailable] = useState(false)

    // ✅ fetch profile with error handling
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getAPI("rider/profile", "GET")
                if (data.status === "success") {
                    setProfile(data.data)
                    setIsAvailable(data.data.isAvailable)  // ✅ inside if block
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error.message)
            }
        }
        fetchProfile()
    }, [])

    const toggleAvailability = async () => {
        const newStatus = !isAvailable
        try {
            await getAPI("rider/availability", "PATCH", { isAvailable: newStatus })
            setIsAvailable(newStatus)
            socket.emit(newStatus ? "rider:online" : "rider:offline")
        } catch (error) {
            console.error("Failed to update availability:", error.message)
        }
    }

    // listen for new orders
    useEffect(() => {
        socket.on("order:new", (data) => {
            setOrder(data)
            setJobStatus("incoming")
        })

        socket.on("order:cancelled", () => {
            setOrder(null)
            setJobStatus(null)
        })

        return () => {
            socket.off("order:new")
            socket.off("order:cancelled")
        }
    }, [socket])

    // emit location every 5s when job is active
    useEffect(() => {
        if (!order || jobStatus === "incoming") return

        const interval = setInterval(() => {
            navigator.geolocation.getCurrentPosition(
                ({ coords }) => {
                    const location = {
                        lat: coords.latitude,
                        lng: coords.longitude,
                    }
                    setMyLocation(location)
                    socket.emit("rider:location", {
                        ...location,
                        customerID: order.customerID,
                        orderID: order.orderID
                    })
                },
                (error) => console.error("Geolocation error:", error),
                { enableHighAccuracy: true }
            )
        }, 5000)

        return () => clearInterval(interval)
    }, [order, jobStatus, socket])

    const acceptOrder = () => {
        socket.emit("order:accept", {
            orderID: order.orderID,
            customerID: order.customerID
        })
        setJobStatus("accepted")
    }

    const rejectOrder = () => {
        socket.emit("order:reject", {
            orderID: order.orderID,
            customerID: order.customerID
        })
        setOrder(null)
        setJobStatus(null)
    }

    const updateStatus = (status) => {
        socket.emit("job:status", {
            orderID: order.orderID,
            customerID: order.customerID,
            status
        })
        setJobStatus(status)
        if (status === "delivered") {
            setOrder(null)
            setJobStatus(null)
            setMyLocation(null)
        }
    }

    return (
        <div className="p-4 space-y-4">

            {/* profile header */}
            {profile && (
                <div className="flex justify-between items-center border p-3 rounded">
                    <div>
                        <p className="font-bold">{profile.user?.name}</p>
                        <p className="text-sm text-gray-500">{profile.vehicle_type}</p>
                    </div>
                    <button
                        onClick={toggleAvailability}
                        className={`px-4 py-2 rounded text-white ${
                            isAvailable ? "bg-green-500" : "bg-gray-400"
                        }`}
                    >
                        {isAvailable ? "🟢 Online" : "⚫ Offline"}
                    </button>
                </div>
            )}

            {/* waiting / offline state */}
            {!order && (
                <div className="text-center text-gray-400 mt-20">
                    <p className="text-4xl mb-2">🛵</p>
                    <p>{isAvailable ? "Waiting for orders..." : "You are offline"}</p>
                </div>
            )}

            {/* incoming order */}
            {order && jobStatus === "incoming" && (
                <OrderCard
                    order={order}
                    onAccept={acceptOrder}
                    onReject={rejectOrder}
                />
            )}

            {/* job in progress */}
            {order && jobStatus !== "incoming" && (
                <>
                    <TrackingMap
                        riderLocation={myLocation}
                        pickupLocation={order?.pickupLoc}
                    />
                    <JobControls
                        status={jobStatus}
                        onUpdateStatus={updateStatus}
                    />
                </>
            )}
        </div>
    )
}

export default RiderPage