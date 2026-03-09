import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { useEffect } from "react"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// fix leaflet default icon bug in vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

// custom icons
const riderIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png",
    iconSize: [40, 40],
})

const pickupIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [35, 35],
})

// auto pan map to new position
const MapUpdater = ({ center }) => {
    const map = useMap()
    useEffect(() => {
        if (center) map.panTo(center)
    }, [center, map])
    return null
}

const TrackingMap = ({ riderLocation, pickupLocation }) => {
    console.log('trackingmap')
    const defaultCenter = pickupLocation
        ? [pickupLocation.lat, pickupLocation.lng]
        : [27.7172, 85.3240] // default kathmandu

    return (
        <MapContainer
            center={defaultCenter}
            zoom={14}
            style={{ height: "400px", width: "100%", borderRadius: "8px" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
            />

            {/* auto pan when rider moves */}
            {riderLocation && (
                <MapUpdater center={[riderLocation.lat, riderLocation.lng]} />
            )}

            {/* rider marker */}
            {riderLocation && (
                <Marker
                    position={[riderLocation.lat, riderLocation.lng]}
                    icon={riderIcon}
                >
                    <Popup>Rider is here</Popup>
                </Marker>
            )}

            {/* pickup marker */}
            {pickupLocation && (
                <Marker
                    position={[pickupLocation.lat, pickupLocation.lng]}
                    icon={pickupIcon}
                >
                    <Popup>Pickup Location</Popup>
                </Marker>
            )}
        </MapContainer>
    )
}

export default TrackingMap