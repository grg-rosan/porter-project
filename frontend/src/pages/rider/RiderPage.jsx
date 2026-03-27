import { useEffect, useState } from "react"
import { useOrderSocket } from "../../hooks/useOrderSocket"
import { getAPI } from "../../api/api"
import OrderCard from "./riderComps/OrderCard"
import JobControls from "./riderComps/JobControls"
import TrackingMap from "../../components/sharedComps/Map"

const RiderPage = () => {
    const [order, setOrder] = useState(null)
    const [jobStatus, setJobStatus] = useState(null)
    const [myLocation, setMyLocation] = useState(null)
    const [profile, setProfile] = useState(null)
    const [isAvailable, setIsAvailable] = useState(false)

    const { acceptOrder, rejectOrder, updateJobStatus, emitLocation, setAvailability } =
        useOrderSocket("rider", {
            onNewOrder: (data) => {
                setOrder(data)
                setJobStatus("incoming")
            },
            onOrderCancelled: () => {
                setOrder(null)
                setJobStatus(null)
            },
        })

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getAPI("rider/profile", "GET")
                if (data.status === "success") {
                    setProfile(data.data)
                    setIsAvailable(data.data.isAvailable)
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error.message)
            }
        }
        fetchProfile()
    }, [])

    // location interval
    useEffect(() => {
        if (!order || jobStatus === "incoming") return

        const interval = setInterval(() => {
            navigator.geolocation.getCurrentPosition(
                ({ coords }) => {
                    const location = { lat: coords.latitude, lng: coords.longitude }
                    setMyLocation(location)
                    emitLocation(location, order.customerID, order.orderID)
                },
                (err) => console.error("Geolocation error:", err),
                { enableHighAccuracy: true }
            )
        }, 5000)

        return () => clearInterval(interval)
    }, [order, jobStatus, emitLocation])

    const toggleAvailability = async () => {
        const newStatus = !isAvailable
        try {
            await getAPI("rider/availability", "PATCH", { isAvailable: newStatus })
            setIsAvailable(newStatus)
            setAvailability(newStatus)
        } catch (error) {
            console.error("Failed to update availability:", error.message)
        }
    }

    const handleAccept = () => {
        acceptOrder(order.orderID, order.customerID)
        setJobStatus("accepted")
    }

    const handleReject = () => {
        rejectOrder(order.orderID, order.customerID)
        setOrder(null)
        setJobStatus(null)
    }

    const handleStatusUpdate = (status) => {
        updateJobStatus(order.orderID, order.customerID, status)
        setJobStatus(status)
        if (status === "delivered") {
            setOrder(null)
            setJobStatus(null)
            setMyLocation(null)
        }
    }

    return (
        <div className="p-4 space-y-4">
            {profile && (
                <div className="flex justify-between items-center border p-3 rounded">
                    <div>
                        <p className="font-bold">{profile.user?.name}</p>
                        <p className="text-sm text-gray-500">{profile.vehicle_type}</p>
                    </div>
                    <button
                        onClick={toggleAvailability}
                        className={`px-4 py-2 rounded text-white ${isAvailable ? "bg-green-500" : "bg-gray-400"}`}
                    >
                        {isAvailable ? "🟢 Online" : "⚫ Offline"}
                    </button>
                </div>
            )}

            {!order && (
                <div className="text-center text-gray-400 mt-20">
                    <p className="text-4xl mb-2">🛵</p>
                    <p>{isAvailable ? "Waiting for orders..." : "You are offline"}</p>
                </div>
            )}

            {order && jobStatus === "incoming" && (
                <OrderCard order={order} onAccept={handleAccept} onReject={handleReject} />
            )}

            {order && jobStatus !== "incoming" && (
                <>
                    <TrackingMap riderLocation={myLocation} pickupLocation={order?.pickupLoc} />
                    <JobControls status={jobStatus} onUpdateStatus={handleStatusUpdate} />
                </>
            )}
        </div>
    )
}

export default RiderPage