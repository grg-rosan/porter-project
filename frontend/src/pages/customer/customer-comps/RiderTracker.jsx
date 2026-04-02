import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// fix vite icon bug
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

// pans map when rider moves
const MapUpdater = ({ center }) => {
    const map = useMap()
    useEffect(() => {
        if (center) map.panTo(center)
    }, [center, map])
    return null
}

const RiderTracker = ({ location, onCancel, showCancel }) => {
    const defaultCenter = [27.7172, 85.3240] // kathmandu fallback

    return (
        <div className="border rounded p-4">
            <h3 className="font-bold mb-2">Rider Tracker</h3>

            {/* map */}
            <div style={{ height: "300px", width: "100%" }} className="mb-4 rounded overflow-hidden">
                <MapContainer
                    center={location ? [location.lat, location.lng] : defaultCenter}
                    zoom={14}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap contributors'
                    />

                    {location ? (
                        <>
                            <MapUpdater center={[location.lat, location.lng]} />
                            <Marker position={[location.lat, location.lng]}>
                                <Popup>🛵 Rider is here</Popup>
                            </Marker>
                        </>
                    ) : (
                        // show default marker while waiting
                        <Marker position={defaultCenter}>
                            <Popup>Waiting for rider...</Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>

            {/* waiting message */}
            {!location && (
                <p className="text-gray-400 text-sm text-center mb-4">
                    Waiting for rider location...
                </p>
            )}

            {/* coordinates */}
            {location && (
                <p className="text-sm text-gray-500 mb-4">
                    📍 Rider at: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
            )}

            {showCancel && (
                <button
                    onClick={onCancel}
                    className="w-full bg-red-500 text-white p-2 rounded"
                >
                    Cancel Order
                </button>
            )}
        </div>
    )
}

export default RiderTracker
