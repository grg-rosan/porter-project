import { useEffect, useRef, useState } from "react";

// ── Mock data ──────────────────────────────────────────────────────────────
const MOCK_ORDERS = [
  {
    id: "ORD-001",
    customer: "Aarav Shrestha",
    pickup: "Thamel, Kathmandu",
    dropoff: "Patan Durbar Square",
    distance: "4.2 km",
    fare: "Rs 320",
    time: "Just now",
    avatar: "A",
  },
  {
    id: "ORD-002",
    customer: "Priya Tamang",
    pickup: "Baluwatar",
    dropoff: "Tribhuvan Airport",
    distance: "8.7 km",
    fare: "Rs 580",
    time: "2 min ago",
    avatar: "P",
  },
];

const COMPLETED_RIDES = [
  { id: "R-091", customer: "Suman KC",       from: "Baneshwor", to: "Koteshwor",    fare: "Rs 210", time: "10:32 AM", rating: 5 },
  { id: "R-090", customer: "Nisha Bajracharya", from: "Lazimpat", to: "Jawalakhel", fare: "Rs 390", time: "09:14 AM", rating: 4 },
  { id: "R-089", customer: "Bikash Rai",     from: "Maharajgunj", to: "Chabahil",   fare: "Rs 175", time: "08:50 AM", rating: 5 },
  { id: "R-088", customer: "Anita Gurung",   from: "Kalanki", to: "Ratnapark",      fare: "Rs 440", time: "Yesterday", rating: 4 },
  { id: "R-087", customer: "Deepak Magar",   from: "Bhaktapur", to: "Thamel",       fare: "Rs 620", time: "Yesterday", rating: 5 },
];

const AVATAR_COLORS = [
  "bg-rose-500", "bg-violet-500", "bg-sky-500",
  "bg-emerald-500", "bg-amber-500", "bg-pink-500",
];

const Icon = ({ name, size = 20, className = "" }) => (
  <span className={`material-symbols-rounded select-none ${className}`} style={{ fontSize: size, lineHeight: 1 }}>
    {name}
  </span>
);

const Stars = ({ count }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Icon key={i} name="star" size={12} className={i < count ? "text-amber-400" : "text-gray-200"} />
    ))}
  </div>
);

// ── New Order Card ─────────────────────────────────────────────────────────
function OrderCard({ order, onAccept, onDecline, index }) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-slide-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
            <span className="text-white font-bold text-sm">{order.avatar}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{order.customer}</p>
            <p className="text-xs text-gray-400">{order.time}</p>
          </div>
        </div>
        <span className="text-sm font-bold text-[#F5A623]">{order.fare}</span>
      </div>

      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          <p className="text-xs text-gray-600 truncate">{order.pickup}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
          <p className="text-xs text-gray-600 truncate">{order.dropoff}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Icon name="route" size={14} className="text-gray-300" />
          {order.distance}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onDecline(order.id)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-500 hover:bg-gray-50 transition"
          >
            Decline
          </button>
          <button
            onClick={() => onAccept(order.id)}
            className="px-3 py-1.5 rounded-lg bg-[#F5A623] text-white text-xs font-bold hover:bg-[#e09510] transition shadow-sm"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Leaflet Map ────────────────────────────────────────────────────────────
function LiveMap() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (mapInstance.current || !mapRef.current) return;

    // Dynamically load Leaflet CSS + JS
    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(cssLink);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      const L = window.L;
      const map = L.map(mapRef.current, { zoomControl: false }).setView([27.7172, 85.3240], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      // Custom driver marker
      const driverIcon = L.divIcon({
        className: "",
        html: `<div style="width:36px;height:36px;background:#F5A623;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25)">
          <span class="material-symbols-rounded" style="font-size:18px;color:white;line-height:1">two_wheeler</span>
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      L.marker([27.7172, 85.3240], { icon: driverIcon })
        .addTo(map)
        .bindPopup("<b>Your location</b><br>Kathmandu");

      // Pickup markers
      const pickupIcon = L.divIcon({
        className: "",
        html: `<div style="width:12px;height:12px;background:#22c55e;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      [[27.7215, 85.3115], [27.7089, 85.3360]].forEach(coords => {
        L.marker(coords, { icon: pickupIcon }).addTo(map);
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);
      mapInstance.current = map;
    };
    document.head.appendChild(script);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden z-0" />;
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function DriverDashboard() {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [rides, setRides] = useState(COMPLETED_RIDES);
  const [online, setOnline] = useState(true);

  const totalEarnings = rides.reduce((sum, r) => {
    const amt = parseInt(r.fare.replace(/\D/g, ""));
    return sum + amt;
  }, 0);

  const acceptOrder = (id) => {
    const order = orders.find((o) => o.id === id);
    if (!order) return;
    setOrders((prev) => prev.filter((o) => o.id !== id));
    setRides((prev) => [
      {
        id: `R-${Math.floor(Math.random() * 900) + 100}`,
        customer: order.customer,
        from: order.pickup,
        to: order.dropoff,
        fare: order.fare,
        time: "Just now",
        rating: 5,
      },
      ...prev,
    ]);
  };

  const declineOrder = (id) => setOrders((prev) => prev.filter((o) => o.id !== id));

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      <style>{`
        * { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Syne', sans-serif; }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease; }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.4); }
        }
        .pulse-dot { animation: pulse-dot 1.5s ease infinite; }
      `}</style>

      <div className="flex h-screen bg-[#f4f1ec] overflow-hidden">

        {/* ── LEFT COLUMN ─────────────────────────────────── */}
        <div className="flex flex-col w-[58%] p-4 gap-4">

          {/* Map */}
          <div className="relative flex-1 rounded-2xl overflow-hidden shadow-md">
            <LiveMap />

            {/* Online toggle overlay */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-2 shadow-md">
              <div className={`w-2 h-2 rounded-full pulse-dot ${online ? "bg-green-500" : "bg-gray-400"}`} />
              <span className="text-xs font-semibold text-gray-700">{online ? "Online" : "Offline"}</span>
              <button
                onClick={() => setOnline((p) => !p)}
                className={`w-10 h-5 rounded-full transition-colors relative ${online ? "bg-green-500" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${online ? "left-5" : "left-0.5"}`} />
              </button>
            </div>

            {/* Order count badge */}
            {orders.length > 0 && (
              <div className="absolute top-4 right-4 z-10 bg-[#F5A623] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-white pulse-dot" />
                {orders.length} new {orders.length === 1 ? "order" : "orders"}
              </div>
            )}
          </div>

          {/* ── Earnings + Completed Rides ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ maxHeight: "42%" }}>

            {/* Earnings bar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#F5A623]/8 to-transparent">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Today's Earnings</p>
                <p className="font-display text-2xl font-800 text-gray-900">Rs {totalEarnings.toLocaleString()}</p>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-800">{rides.length}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Rides</p>
                </div>
                <div className="w-px bg-gray-100" />
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-800">4.9</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Rating</p>
                </div>
                <div className="w-px bg-gray-100" />
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-800">38km</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Distance</p>
                </div>
              </div>
            </div>

            {/* Rides list */}
            <div className="overflow-y-auto" style={{ maxHeight: "200px" }}>
              {rides.map((ride, i) => (
                <div key={ride.id} className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition ${i < rides.length - 1 ? "border-b border-gray-50" : ""}`}>
                  <div className={`w-8 h-8 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-xs font-bold">{ride.customer[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{ride.customer}</p>
                    <p className="text-xs text-gray-400 truncate">{ride.from} → {ride.to}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-800">{ride.fare}</p>
                    <Stars count={ride.rating} />
                  </div>
                  <span className="text-[10px] text-gray-300 ml-1 flex-shrink-0">{ride.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN — New Orders ────────────────────── */}
        <div className="flex flex-col w-[42%] p-4 pl-0">
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-display font-bold text-gray-900 text-base">Incoming Orders</h2>
                <p className="text-xs text-gray-400 mt-0.5">Accept or decline ride requests</p>
              </div>
              {orders.length > 0 && (
                <span className="w-6 h-6 rounded-full bg-[#F5A623] text-white text-xs font-bold flex items-center justify-center">
                  {orders.length}
                </span>
              )}
            </div>

            {/* Orders list or empty state */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                    <Icon name="inbox" size={32} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-semibold text-gray-400">No new orders</p>
                  <p className="text-xs text-gray-300 mt-1">New customer orders will appear here</p>
                </div>
              ) : (
                orders.map((order, i) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    index={i}
                    onAccept={acceptOrder}
                    onDecline={declineOrder}
                  />
                ))
              )}
            </div>

            {/* Footer status */}
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${online ? "bg-green-500 pulse-dot" : "bg-gray-300"}`} />
                <span className="text-xs text-gray-400">{online ? "Accepting orders" : "You are offline"}</span>
              </div>
              <button className="text-xs text-[#F5A623] font-semibold hover:underline">View all</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}