import React, { useState, useEffect } from "react";

/* ─── Inject Material Icons font if not already present ─── */
if (typeof document !== "undefined" && !document.getElementById("mat-icons-font")) {
  const link = document.createElement("link");
  link.id   = "mat-icons-font";
  link.rel  = "stylesheet";
  link.href = "https://fonts.googleapis.com/icon?family=Material+Icons+Round";
  document.head.appendChild(link);
}

/* ─── Static data ─── */
const RIDE_TYPES = [
  { icon: "two_wheeler",      label: "Bike",      price: "Rs 120+", eta: "3 min"  },
  { icon: "electric_moped",   label: "Moto Fix",  price: "Rs 150",  eta: "5 min"  },
  { icon: "directions_car",   label: "Ride",      price: "Rs 280+", eta: "7 min"  },
  { icon: "route",            label: "City2City", price: "Rs 800+", eta: "15 min" },
];

const RECENT_PLACES = [
  { icon: "home",           label: "Home",        sub: "Thamel, Kathmandu"     },
  { icon: "work",           label: "Office",      sub: "Durbar Marg, KTM"      },
  { icon: "storefront",     label: "Lotse Mall",  sub: "Jhamsikhel, Lalitpur"  },
  { icon: "flight",         label: "TIA Airport", sub: "Sinamangal, KTM"       },
  { icon: "local_hospital", label: "Bir Hospital",sub: "Mahabouddha, KTM"      },
];

const RIDE_HISTORY = [
  { id:"R-112", driver:"Ramesh Thapa",  from:"Thamel",    to:"Patan",       fare:"Rs 280", date:"Today, 10:14 AM",    rating:5, type:"Moto",    color:"#f43f5e" },
  { id:"R-111", driver:"Sunita Karki",  from:"Baluwatar", to:"Airport",     fare:"Rs 560", date:"Yesterday, 8:30 AM", rating:4, type:"Ride",    color:"#8b5cf6" },
  { id:"R-110", driver:"Dipak Magar",   from:"Lazimpat",  to:"Koteshwor",   fare:"Rs 190", date:"Mar 12, 3:00 PM",    rating:5, type:"Moto",    color:"#0ea5e9" },
  { id:"R-109", driver:"Hari Shrestha", from:"Baneshwor", to:"Maharajgunj", fare:"Rs 230", date:"Mar 11, 9:45 AM",    rating:4, type:"Comfort", color:"#10b981" },
];

const PAYMENT = [
  { icon: "payments",                label: "Cash"   },
  { icon: "credit_card",             label: "Card"   },
  { icon: "account_balance_wallet",  label: "Wallet" },
];

const TRACK_STEPS = [
  { label: "Driver assigned",   sub: "Ramesh Thapa · BA 12 PA 3201" },
  { label: "Driver on the way", sub: "Arriving in 3 min"            },
  { label: "Ride in progress",  sub: "Heading to destination"        },
  { label: "Arrived!",          sub: "Hope you had a great ride 🎉"  },
];

/* ─── Tiny helpers ─── */
const Icon = ({ name, size = 18, className = "" }) => (
  <span className={`material-icons-round ${className}`} style={{ fontSize: size }}>
    {name}
  </span>
);

const Stars = ({ count }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < count ? "#f59e0b" : "#d4d4d4", fontSize: 13 }}>★</span>
    ))}
  </div>
);

/* ─── Order tracker sub-component ─── */
const OrderTracker = ({ pickup, dropoff, rideLabel, onCancel }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [1, 2, 3].map((s, i) =>
      setTimeout(() => setStep(s), (i + 1) * 3000)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900 text-base">Tracking ride</h2>
          <p className="text-xs text-gray-400 mt-0.5">{pickup} → {dropoff}</p>
        </div>
        <span className="text-xs bg-green-100 text-green-600 font-semibold px-2.5 py-1 rounded-full">
          ● Live
        </span>
      </div>

      {/* Driver card */}
      <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-base flex-shrink-0"
          style={{ background: "#f43f5e" }}>
          R
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">Ramesh Thapa</p>
          <p className="text-xs text-gray-400">BA 12 PA 3201 · {rideLabel}</p>
          <p className="text-xs text-amber-500 font-semibold mt-0.5">★ 4.9 (312 rides)</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {["phone", "chat_bubble_outline"].map((ic) => (
            <button key={ic}
              className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-400 transition">
              <Icon name={ic} size={17} />
            </button>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="flex flex-col">
        {TRACK_STEPS.map((s, i) => {
          const done   = i < step;
          const active = i === step;
          const isLast = i === TRACK_STEPS.length - 1;
          return (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0 transition-all
                  ${done ? "bg-green-500" : active ? "bg-orange-400 ring-4 ring-orange-100" : "bg-gray-200"}`}>
                  {done
                    ? <Icon name="check" size={11} />
                    : <span className="text-[10px] font-bold">{i + 1}</span>
                  }
                </div>
                {!isLast && (
                  <div className={`w-0.5 h-7 mt-1 ${done ? "bg-green-400" : "bg-gray-200"}`} />
                )}
              </div>
              <div className="pb-7">
                <p className={`text-sm font-semibold ${active ? "text-orange-500" : done ? "text-gray-900" : "text-gray-300"}`}>
                  {s.label}
                </p>
                {(active || done) && (
                  <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onCancel}
        className="w-full py-3.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition">
        Cancel Ride
      </button>
    </div>
  );
};

/* ─── Main component ─── */
const OrderFormComp = ({ onSubmit }) => {
  const [activeTab,     setActiveTab]     = useState("book");
  const [activeRide,    setActiveRide]    = useState(0);
  const [activePay,     setActivePay]     = useState(0);
  const [pickup,        setPickup]        = useState("");
  const [dropoff,       setDropoff]       = useState("");
  const [promoCode,     setPromoCode]     = useState("");
  const [promoApplied,  setPromoApplied]  = useState(false);
  const [ordered,       setOrdered]       = useState(false);

  const canBook      = pickup.trim() !== "" && dropoff.trim() !== "";
  const selectedRide = RIDE_TYPES[activeRide];

  const handleSwap = () => {
    setPickup(dropoff);
    setDropoff(pickup);
  };

  const handleBook = () => {
    if (!canBook) return;
    // Call parent callback
    onSubmit?.({
      pickup_address: pickup,
      drop_address:   dropoff,
      vehicle_type:   selectedRide.label.toUpperCase(),
    });
    setOrdered(true);
  };

  const handleCancel = () => {
    setOrdered(false);
    setPickup("");
    setDropoff("");
    setPromoCode("");
    setPromoApplied(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── Tabs ── */}
      <div className="flex bg-gray-100 p-1.5 gap-1 flex-shrink-0">
        {[
          { key: "book",    icon: "add_circle_outline", label: "Book Ride" },
          { key: "history", icon: "history",            label: "History"   },
        ].map((t) => (
          <button key={t.key}
            onClick={() => { setActiveTab(t.key); setOrdered(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all
              ${activeTab === t.key
                ? "bg-white text-orange-400 shadow-sm"
                : "text-gray-400 hover:text-gray-600"}`}>
            <span className="material-icons-round" style={{ fontSize: 16 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── BOOK TAB ── */}
      {activeTab === "book" && (
        <div className="flex-1 overflow-y-auto">
          {!ordered ? (
            <div className="p-4 flex flex-col gap-4">

              {/* Location inputs */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  {/* dot line */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-sm" />
                    <div className="w-px h-5 bg-gray-300" />
                    <div className="w-3 h-3 rounded-full bg-red-400 border-2 border-white shadow-sm" />
                  </div>

                  {/* inputs */}
                  <div className="flex-1 flex flex-col gap-2">
                    <input
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      placeholder="Pickup location"
                      className="w-full bg-white rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 border border-gray-100 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                    />
                    <input
                      value={dropoff}
                      onChange={(e) => setDropoff(e.target.value)}
                      placeholder="Where to?"
                      className="w-full bg-white rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 border border-gray-100 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                    />
                  </div>

                  {/* swap */}
                  <button
                    onClick={handleSwap}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition flex-shrink-0">
                    <Icon name="swap_vert" size={16} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Recent places */}
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2 px-1">
                  Recent places
                </p>
                <div className="flex flex-col gap-0.5">
                  {RECENT_PLACES.map((p) => (
                    <button key={p.label}
                      onClick={() => setDropoff(p.sub)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition text-left">
                      <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Icon name={p.icon} size={16} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{p.label}</p>
                        <p className="text-xs text-gray-400">{p.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ride type */}
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2 px-1">
                  Choose ride type
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {RIDE_TYPES.map((ride, i) => (
                    <button key={ride.label}
                      onClick={() => setActiveRide(i)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl border-2 transition-all text-left
                        ${activeRide === i
                          ? "border-orange-400 bg-orange-50"
                          : "border-gray-100 bg-gray-50 hover:border-gray-200"}`}>
                      <Icon
                        name={ride.icon} size={22}
                        className={activeRide === i ? "text-orange-400" : "text-gray-400"} />
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate
                          ${activeRide === i ? "text-orange-400" : "text-gray-700"}`}>
                          {ride.label}
                        </p>
                        <p className="text-[10px] text-gray-400">{ride.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fare estimate — shown only when both fields filled */}
              {canBook && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-700">Fare estimate</p>
                    <span className="text-xs text-gray-400">ETA {selectedRide.eta}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-extrabold text-gray-900">{selectedRide.price}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {selectedRide.label} · {PAYMENT[activePay].label}
                      </p>
                    </div>
                    <Icon name={selectedRide.icon} size={32} className="text-orange-400 opacity-60" />
                  </div>
                </div>
              )}

              {/* Promo code */}
              <div className="flex gap-2">
                <input
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    if (!e.target.value) setPromoApplied(false);
                  }}
                  placeholder="Promo code"
                  className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 border border-gray-100 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                />
                <button
                  onClick={() => promoCode.trim() && setPromoApplied(true)}
                  className={`px-4 rounded-xl text-xs font-bold transition whitespace-nowrap
                    ${promoApplied
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {promoApplied ? "Applied ✓" : "Apply"}
                </button>
              </div>

              {/* Payment */}
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2 px-1">
                  Payment
                </p>
                <div className="flex gap-2">
                  {PAYMENT.map((pay, i) => (
                    <button key={pay.label}
                      onClick={() => setActivePay(i)}
                      className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition
                        ${activePay === i
                          ? "border-orange-400 bg-orange-50 text-orange-400"
                          : "border-gray-100 text-gray-400 hover:border-gray-200"}`}>
                      <Icon name={pay.icon} size={17} />
                      <span className="text-xs font-semibold">{pay.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Book button */}
              <button
                onClick={handleBook}
                disabled={!canBook}
                className={`w-full py-4 rounded-2xl text-sm font-bold transition-all
                  ${canBook
                    ? "bg-orange-400 text-white shadow-md hover:bg-orange-500 hover:-translate-y-0.5"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
                {canBook
                  ? `Book ${selectedRide.label} · ${selectedRide.price}`
                  : "Enter pickup & destination"}
              </button>

            </div>
          ) : (
            /* Tracking */
            <div className="p-4">
              <OrderTracker
                pickup={pickup}
                dropoff={dropoff}
                rideLabel={selectedRide.label}
                onCancel={handleCancel}
              />
            </div>
          )}
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {activeTab === "history" && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Recent rides
            </p>
            <button className="text-xs text-orange-400 font-bold">See all</button>
          </div>

          {RIDE_HISTORY.map((ride) => (
            <div key={ride.id}
              className="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition cursor-pointer">
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: ride.color }}>
                    <span className="text-white font-bold text-sm">{ride.driver[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{ride.driver}</p>
                    <p className="text-xs text-gray-400">{ride.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-gray-800">{ride.fare}</p>
                  <span className="text-[10px] text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
                    {ride.type}
                  </span>
                </div>
              </div>

              {/* Route */}
              <div className="flex flex-col gap-1.5 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                  <p className="text-xs text-gray-600">{ride.from}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                  <p className="text-xs text-gray-600">{ride.to}</p>
                </div>
              </div>

              {/* Bottom */}
              <div className="flex items-center justify-between">
                <Stars count={ride.rating} />
                <button
                  onClick={() => {
                    setActiveTab("book");
                    setDropoff(ride.to);
                    setPickup(ride.from);
                  }}
                  className="text-xs text-orange-400 font-bold hover:underline">
                  Book again
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderFormComp;