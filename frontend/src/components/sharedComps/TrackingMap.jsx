const Icon = ({ name, size = 20, className = "" }) => (
  <span
    className={`material-symbols-rounded select-none ${className}`}
    style={{ fontSize: size, lineHeight: 1 }}
  >
    {name}
  </span>
);

// Replace inner content with your real map library (Leaflet, Mapbox, Google Maps, etc.)
export default function TrackingMap({ riderLocation, pickupLocation }) {
  return (
    <div className="w-full h-full relative bg-gray-100 rounded-2xl overflow-hidden">

      {/* Grid texture to suggest a map */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(#d1d5db 1px, transparent 1px), linear-gradient(90deg, #d1d5db 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Placeholder center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center">
          <Icon name="map" size={28} className="text-orange-400" />
        </div>
        <p
          className="text-sm font-medium text-gray-400"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Map renders here
        </p>
      </div>

      {/* Rider location badge */}
      {riderLocation && (
        <div className="absolute top-4 left-4 bg-white rounded-xl shadow-md px-3 py-2 flex items-center gap-2">
          <Icon name="two_wheeler" size={16} className="text-orange-400" />
          <span className="text-xs font-semibold text-gray-700">
            {riderLocation.lat.toFixed(4)}, {riderLocation.lng.toFixed(4)}
          </span>
        </div>
      )}

      {/* Pickup badge */}
      {pickupLocation && (
        <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-md px-3 py-2 flex items-center gap-2">
          <Icon name="location_on" size={16} className="text-green-500" />
          <span className="text-xs font-semibold text-gray-700">Pickup set</span>
        </div>
      )}
    </div>
  );
}