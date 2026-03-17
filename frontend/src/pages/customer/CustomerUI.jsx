import { useEffect, useRef, useState } from "react";

// ── Constants ──────────────────────────────────────────────────────────────



// ── Helpers ────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 20, className = "" }) => (
  <span
    className={`material-symbols-rounded select-none ${className}`}
    style={{ fontSize: size, lineHeight: 1 }}
  >
    {name}
  </span>
);

const Stars = ({ count, interactive = false, onRate }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <span
        key={i}
        onClick={() => interactive && onRate && onRate(i + 1)}
        className={`material-symbols-rounded select-none ${interactive ? "cursor-pointer" : ""}`}
        style={{
          fontSize: 13,
          lineHeight: 1,
          color: i < count ? "#F5A623" : "#e5e7eb",
        }}
      >
        star
      </span>
    ))}
  </div>
);

// ── Leaflet Map ────────────────────────────────────────────────────────────
function CustomerMap({ pickup, dropoff }) {
  const mapRef = useRef(null);
  const mapInst = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (mapInst.current || !mapRef.current) return;

    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(cssLink);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      const L = window.L;
      const map = L.map(mapRef.current, { zoomControl: false }).setView(
        [27.7172, 85.324],
        13,
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      // User location pin
      const userIcon = L.divIcon({
        className: "",
        html: `<div style="width:32px;height:32px;background:#F5A623;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25)">
          <span class="material-symbols-rounded" style="font-size:16px;color:white;line-height:1">person_pin_circle</span>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      L.marker([27.7172, 85.324], { icon: userIcon })
        .addTo(map)
        .bindPopup("Your location");
      L.control.zoom({ position: "bottomright" }).addTo(map);
      mapInst.current = map;
    };
    document.head.appendChild(script);

    return () => {
      if (mapInst.current) {
        mapInst.current.remove();
        mapInst.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100%" }}
      className="rounded-2xl overflow-hidden"
    />
  );
}

// ── Order Status Tracker ───────────────────────────────────────────────────
function OrderTracker({ onCancel }) {
  const steps = [
    "Order placed",
    "Driver assigned",
    "Driver en route",
    "Arrived",
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= steps.length - 1) return;
    const t = setTimeout(() => setStep((s) => s + 1), 2500);
    return () => clearTimeout(t);
  }, [step]);

  const driver = {
    name: "Ramesh Thapa",
    plate: "BA 12 PA 3456",
    rating: 4.9,
    avatar: "R",
    rides: 1243,
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Driver card */}
      <div className="bg-[#F5A623]/8 border border-[#F5A623]/20 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-[#c97d10] uppercase tracking-wider">
            Driver assigned
          </p>
          <span className="text-xs text-gray-400">ETA 3 min</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-rose-500 flex items-center justify-center shrink-0">
            <span className="text-white font-bold">{driver.avatar}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-800">{driver.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Stars count={Math.round(driver.rating)} />
              <span className="text-xs text-gray-400">
                {driver.rating} · {driver.rides} rides
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">
              {driver.plate}
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
            <Icon name="call" size={14} /> Call
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
            <Icon name="chat" size={14} /> Message
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-100 text-xs font-medium text-red-400 hover:bg-red-50 transition">
            <Icon name="close" size={14} /> Cancel
          </button>
        </div>
      </div>

      {/* Progress steps */}
      <div className="relative">
        <div className="absolute left-3.5 top-4 bottom-4 w-0.5 bg-gray-100" />
        <div
          className="absolute left-3.5 top-4 w-0.5 bg-[#F5A623] transition-all duration-700"
          style={{ height: `${(step / (steps.length - 1)) * 100}%` }}
        />
        <div className="space-y-5">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-3 relative">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-300 ${
                  i < step
                    ? "bg-[#F5A623]"
                    : i === step
                      ? "bg-[#F5A623] ring-4 ring-[#F5A623]/20"
                      : "bg-white border-2 border-gray-200"
                }`}
              >
                {i < step ? (
                  <Icon name="check" size={14} className="text-white" />
                ) : i === step ? (
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                )}
              </div>
              <span
                className={`text-sm font-medium transition-colors ${i <= step ? "text-gray-800" : "text-gray-400"}`}
              >
                {s}
              </span>
              {i === step && (
                <span className="ml-auto text-[10px] text-[#F5A623] font-semibold animate-pulse">
                  In progress
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onCancel}
        className="w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition font-medium"
      >
        Cancel ride
      </button>
    </div>
  );
}

// ── Main Customer Dashboard ────────────────────────────────────────────────
export default function CustomerDashboard() {
  const [activeRide, setActiveRide] = useState(0);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [activeTab, setActiveTab] = useState("book"); // book | history
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const selectedRide = RIDE_TYPES[activeRide];
  const canBook = pickup.trim() && dropoff.trim();

  const handleBook = () => {
    if (!canBook) return;
    setOrderPlaced(true);
    setActiveTab("book");
  };

  const handleCancel = () => {
    setOrderPlaced(false);
    setPickup("");
    setDropoff("");
    setPromoCode("");
    setPromoApplied(false);
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap"
        rel="stylesheet"
      />
      <style>{`
        * { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Syne', sans-serif; }
          .leaflet-container {
        width: 100% !important;
        height: 100% !important;}
        @keyframes fade-up { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fade-up 0.3s ease; }
        @keyframes pulse-ring { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:.5;transform:scale(1.3);} }
        .pulse-ring { animation: pulse-ring 1.5s ease infinite; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
      `}</style>

      <div className="flex h-screen bg-[#f4f1ec] overflow-hidden">
        {/* ── LEFT: Full Map ─────────────────────────────── */}
        <div className="flex-1 relative h-full overflow-hidden "style={{height:"80vh"}}>
          <CustomerMap pickup={pickup} dropoff={dropoff} />

          {/* Map overlay — top bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2.5 shadow-md">
              <div className="w-6 h-6 bg-[#F5A623] rounded-md flex items-center justify-center">
                <Icon name="local_taxi" size={14} className="text-white" />
              </div>
              <span className="font-display font-bold text-gray-900 text-sm">
                Porter
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition">
                <Icon
                  name="notifications"
                  size={18}
                  className="text-gray-600"
                />
              </button>
              <button className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full pl-1 pr-3 py-1 shadow-md hover:bg-white transition">
                <div className="w-7 h-7 rounded-full bg-violet-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">R</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  Roshan
                </span>
              </button>
            </div>
          </div>

          {/* Map overlay — bottom promo banner */}
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="bg-gradient-to-r from-[#F5A623] to-[#e09510] rounded-2xl p-4 flex items-center justify-between shadow-lg">
              <div>
                <p className="text-white font-bold text-sm">
                  🎉 First ride free!
                </p>
                <p className="text-white/80 text-xs mt-0.5">
                  Use code WELCOME at checkout
                </p>
              </div>
              <button className="bg-white text-[#e09510] text-xs font-bold px-4 py-2 rounded-xl hover:bg-white/90 transition">
                Claim
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Order Panel ──────────────────────────── */}
        <div className="w-400px flex flex-col bg-white shadow-xl border-l border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 px-4 pt-4 gap-1">
            {[
              { key: "book", label: "Book a Ride", icon: "add_circle" },
              { key: "history", label: "My Rides", icon: "history" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-sm font-semibold transition-all border-b-2 ${
                  activeTab === tab.key
                    ? "text-[#F5A623] border-[#F5A623] bg-[#F5A623]/5"
                    : "text-gray-400 border-transparent hover:text-gray-600"
                }`}
              >
                <Icon name={tab.icon} size={16} />
                {tab.label}
              </button>
            ))}
          </div>


          {/* Bottom safe area */}
          <div className="h-4 bg-white" />
        </div>
      </div>
    </>
  );
}
