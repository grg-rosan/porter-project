import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import { useEffect } from "react";
import { useGetCoords } from "../../hooks/getCoords";

// Component to update map when coords change
function MapUpdater({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords);     // update center
      map.invalidateSize();    // recalc tiles
    }
  }, [coords, map]);

  return null;
}

function Map() {
  const coords = useGetCoords(); // call hook once


  return (
    <div style={{ height: "500px", width: "100%" }}>
      <MapContainer
        center={coords}
        zoom={15}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={coords} />
        <MapUpdater coords={coords} /> {/* updates map center & tiles */}
      </MapContainer>
    </div>
  );
}

export default Map;