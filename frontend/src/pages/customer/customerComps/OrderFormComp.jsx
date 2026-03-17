
import React, { useState, useEffect } from "react";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 1 — STATIC DATA
   All hardcoded lists live here so the component
   body stays clean. In production, these would
   come from an API or props.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const RIDE_TYPES = [
  { icon: "two_wheeler",    label: "Bike",      price: "Rs 120+", eta: "3 min"  },
  { icon: "electric_moped", label: "Moto Fix",  price: "Rs 150",  eta: "5 min"  },
  { icon: "directions_car", label: "Ride",      price: "Rs 280+", eta: "7 min"  },
  { icon: "route",          label: "City2City", price: "Rs 800+", eta: "15 min" },
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
  { icon: "payments",               label: "Cash"   },
  { icon: "credit_card",            label: "Card"   },
  { icon: "account_balance_wallet", label: "Wallet" },
];

const TRACK_STEPS = [
  { label: "Driver assigned",   sub: "Ramesh Thapa · BA 12 PA 3201" },
  { label: "Driver on the way", sub: "Arriving in 3 min"            },
  { label: "Ride in progress",  sub: "Heading to destination"        },
  { label: "Arrived!",          sub: "Hope you had a great ride 🎉"  },
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 2 — SHARED UI PRIMITIVES
   Tiny reusable components used throughout the
   form. Kept here (not separate files) because
   they're tightly scoped to this component.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/**
 * Icon — wraps Material Icons Round.
 * Requires the font loaded in index.html (see top).
 * `name`      → Material icon ligature e.g. "two_wheeler"
 * `size`      → font-size in px (default 18)
 * `className` → extra Tailwind classes e.g. "text-orange-400"
 */
const Icon = ({ name, size = 18, className = "" }) => (
  <span
    className={`material-icons-round leading-none select-none ${className}`}
    style={{ fontSize: size }}
  >
    {name}
  </span>
);

/**
 * Stars — renders a 5-star rating row.
 * Filled stars are amber, empty stars are light gray.
 */
const Stars = ({ count }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < count ? "#f59e0b" : "#d4d4d4", fontSize: 13 }}>
        ★
      </span>
    ))}
  </div>
);

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 3 — ORDER TRACKER
   Shown after a ride is booked. Displays:
   - Live ride header with route summary
   - Driver info card with call/chat actions
   - Step-by-step progress tracker (auto-advances
     every 3s to simulate real tracking updates)
   - Cancel button
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const OrderTracker = ({ pickup, dropoff, rideLabel, onCancel }) => {
  // `step` tracks which TRACK_STEPS index is currently active.
  // Advances automatically via setTimeout to simulate live updates.
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Schedule steps 1 → 2 → 3 at 3s intervals
    const timers = [1, 2, 3].map((s, i) =>
      setTimeout(() => setStep(s), (i + 1) * 3000)
    );
    // Clean up if component unmounts (e.g. user cancels mid-tracking)
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col gap-4">

      {/* ── Live ride header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900 text-base">Tracking ride</h2>
          <p className="text-xs text-gray-400 mt-0.5">{pickup} → {dropoff}</p>
        </div>
        <span className="text-xs bg-green-100 text-green-600 font-semibold px-2.5 py-1 rounded-full">
          ● Live
        </span>
      </div>

      {/* ── Driver info card ── */}
      <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-base shrink-0"
          style={{ background: "#f43f5e" }}
        >
          R
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">Ramesh Thapa</p>
          <p className="text-xs text-gray-400">BA 12 PA 3201 · {rideLabel}</p>
          <p className="text-xs text-amber-500 font-semibold mt-0.5">★ 4.9 (312 rides)</p>
        </div>
        {/* Call / Chat action buttons */}
        <div className="flex gap-2 shrink-0">
          {["phone", "chat_bubble_outline"].map((ic) => (
            <button
              key={ic}
              className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-400 transition"
            >
              <Icon name={ic} size={17} />
            </button>
          ))}
        </div>
      </div>

      {/* ── Progress steps ── */}
      <div className="flex flex-col">
        {TRACK_STEPS.map((s, i) => {
          const done   = i < step;   // step already passed
          const active = i === step; // currently active step
          const isLast = i === TRACK_STEPS.length - 1;
          return (
            <div key={i} className="flex gap-3">
              {/* Step dot + vertical connector line */}
              <div className="flex flex-col items-center">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 transition-all
                  ${done ? "bg-green-500" : active ? "bg-orange-400 ring-4 ring-orange-100" : "bg-gray-200"}`}
                >
                  {done
                    ? <Icon name="check" size={11} />
                    : <span className="text-[10px] font-bold">{i + 1}</span>
                  }
                </div>
                {/* Connector hidden after last step */}
                {!isLast && (
                  <div className={`w-0.5 h-7 mt-1 ${done ? "bg-green-400" : "bg-gray-200"}`} />
                )}
              </div>
              {/* Step label + subtitle (subtitle only shows when active or done) */}
              <div className="pb-7">
                <p className={`text-sm font-semibold
                  ${active ? "text-orange-500" : done ? "text-gray-900" : "text-gray-300"}`}
                >
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

      {/* ── Cancel button ── */}
      <button
        onClick={onCancel}
        className="w-full py-3.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition"
      >
        Cancel Ride
      </button>
    </div>
  );
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 4 — MAIN COMPONENT
   Props:
     onSubmit(data) — called on booking.
       data = { pickup_address, drop_address, vehicle_type }

   State:
     activeTab    "book" | "history"
     activeRide   index into RIDE_TYPES (selected vehicle)
     activePay    index into PAYMENT (selected method)
     pickup       controlled input — pickup location string
     dropoff      controlled input — dropoff location string
     promoCode    controlled input — promo code string
     promoApplied whether promo code has been applied
     ordered      true after booking → shows OrderTracker
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const OrderFormComp = ({ onSubmit }) => {
  const [activeTab,    setActiveTab]    = useState("book");
  const [activeRide,   setActiveRide]   = useState(0);
  const [activePay,    setActivePay]    = useState(0);
  const [pickup,       setPickup]       = useState("");
  const [dropoff,      setDropoff]      = useState("");
  const [promoCode,    setPromoCode]    = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [ordered,      setOrdered]      = useState(false);

  // Derived — both fields non-empty enables the Book button
  const canBook      = pickup.trim() !== "" && dropoff.trim() !== "";
  const selectedRide = RIDE_TYPES[activeRide];

  // Swaps pickup ↔ dropoff values
  const handleSwap = () => {
    setPickup(dropoff);
    setDropoff(pickup);
  };

  // Fires onSubmit prop, then switches to tracking view
  const handleBook = () => {
    if (!canBook) return;
    onSubmit?.({
      pickup_address: pickup,
      drop_address:   dropoff,
      vehicle_type:   selectedRide.label.toUpperCase(),
    });
    setOrdered(true);
  };

  // Resets everything back to the empty booking form
  const handleCancel = () => {
    setOrdered(false);
    setPickup("");
    setDropoff("");
    setPromoCode("");
    setPromoApplied(false);
  };

  return (
    /**
     * Root wrapper.
     * `fontFamily` inline style ensures Plus Jakarta Sans applies to the
     * entire subtree even if Tailwind config hasn't been updated.
     * Remove the style prop once you've added it to tailwind.config.js.
     */
    <div
      className="flex flex-col h-full"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 4a — TAB BAR
          Active tab gets a white pill + orange text.
          Switching tabs resets `ordered` so the form
          doesn't stay on the tracking view.
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex bg-gray-100 p-1.5 gap-1 shrink-0">
        {[
          { key: "book",    icon: "add_circle_outline", label: "Book Ride" },
          { key: "history", icon: "history",            label: "History"   },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => { setActiveTab(t.key); setOrdered(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all
              ${activeTab === t.key
                ? "bg-white text-orange-400 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
              }`}
          >
            {/* Inline span instead of <Icon> to guarantee font class applies */}
            <span className="material-icons-round leading-none" style={{ fontSize: 16 }}>
              {t.icon}
            </span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 4b — BOOK TAB
          Two sub-views via `ordered` boolean:
            false → booking form (inputs, ride picker, payment)
            true  → live OrderTracker component
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === "book" && (
        <div className="flex-1 overflow-y-auto">
          {!ordered ? (
            <div className="p-4 flex flex-col gap-4">

              {/* ── Location inputs ──
                  Dot-line visual connector links pickup (green) to
                  dropoff (red). Swap button inverts both values.   */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-sm" />
                    <div className="w-px h-5 bg-gray-300" />
                    <div className="w-3 h-3 rounded-full bg-red-400 border-2 border-white shadow-sm" />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <input
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      placeholder="Pickup location"
                      className="w-full bg-white rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 border border-gray-100 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                      style={{ fontFamily: "inherit" }}
                    />
                    <input
                      value={dropoff}
                      onChange={(e) => setDropoff(e.target.value)}
                      placeholder="Where to?"
                      className="w-full bg-white rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 border border-gray-100 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                      style={{ fontFamily: "inherit" }}
                    />
                  </div>
                  <button
                    onClick={handleSwap}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition shrink-0"
                  >
                    <Icon name="swap_vert" size={16} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* ── Recent places ──
                  Tapping any row sets it as the dropoff value.  */}
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2 px-1">
                  Recent places
                </p>
                <div className="flex flex-col gap-0.5">
                  {RECENT_PLACES.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => setDropoff(p.sub)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition text-left"
                    >
                      <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
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

              {/* ── Ride type selector ──
                  2-column grid. Active card: orange border + tint.
                  Each card shows icon, label, and base price.     */}
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2 px-1">
                  Choose ride type
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {RIDE_TYPES.map((ride, i) => (
                    <button
                      key={ride.label}
                      onClick={() => setActiveRide(i)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl border-2 transition-all text-left
                        ${activeRide === i
                          ? "border-orange-400 bg-orange-50"
                          : "border-gray-100 bg-gray-50 hover:border-gray-200"
                        }`}
                    >
                      <Icon
                        name={ride.icon} size={22}
                        className={activeRide === i ? "text-orange-400" : "text-gray-400"}
                      />
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate
                          ${activeRide === i ? "text-orange-400" : "text-gray-700"}`}
                        >
                          {ride.label}
                        </p>
                        <p className="text-[10px] text-gray-400">{ride.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Fare estimate ──
                  Only rendered when canBook is true.
                  Price and ETA come from the selected ride type.
                  Payment label reflects the active payment method. */}
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

              {/* ── Promo code ──
                  Input auto-uppercases on change.
                  Apply button turns green once a code is applied.
                  Clearing the input resets promoApplied.          */}
              <div className="flex gap-2">
                <input
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    if (!e.target.value) setPromoApplied(false);
                  }}
                  placeholder="Promo code"
                  className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 border border-gray-100 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                  style={{ fontFamily: "inherit" }}
                />
                <button
                  onClick={() => promoCode.trim() && setPromoApplied(true)}
                  className={`px-4 rounded-xl text-xs font-bold transition whitespace-nowrap
                    ${promoApplied
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                >
                  {promoApplied ? "Applied ✓" : "Apply"}
                </button>
              </div>

              {/* ── Payment selector ──
                  Active option: orange border + tint.
                  Updates activePay; fare estimate reflects the choice. */}
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2 px-1">
                  Payment
                </p>
                <div className="flex gap-2">
                  {PAYMENT.map((pay, i) => (
                    <button
                      key={pay.label}
                      onClick={() => setActivePay(i)}
                      className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition
                        ${activePay === i
                          ? "border-orange-400 bg-orange-50 text-orange-400"
                          : "border-gray-100 text-gray-400 hover:border-gray-200"
                        }`}
                    >
                      <Icon name={pay.icon} size={17} />
                      <span className="text-xs font-semibold">{pay.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Book button ──
                  Disabled + gray when canBook is false.
                  Shows ride label + price when enabled.  */}
              <button
                onClick={handleBook}
                disabled={!canBook}
                className={`w-full py-4 rounded-2xl text-sm font-bold transition-all
                  ${canBook
                    ? "bg-orange-400 text-white shadow-md hover:bg-orange-500 hover:-translate-y-0.5"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
              >
                {canBook
                  ? `Book ${selectedRide.label} · ${selectedRide.price}`
                  : "Enter pickup & destination"}
              </button>

            </div>
          ) : (
            /* ── Tracking view (shown after booking) ── */
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

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 4c — HISTORY TAB
          Lists past rides. Each card shows:
          - Color-coded driver initial avatar
          - Driver name, date, fare, ride type
          - From/to route with dot indicators
          - Star rating
          - "Book again" — pre-fills the form and
            switches back to the Book tab
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === "history" && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Recent rides
            </p>
            <button className="text-xs text-orange-400 font-bold">See all</button>
          </div>

          {RIDE_HISTORY.map((ride) => (
            <div
              key={ride.id}
              className="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition cursor-pointer"
            >
              {/* Driver row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: ride.color }}
                  >
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

              {/* Route dots */}
              <div className="flex flex-col gap-1.5 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  <p className="text-xs text-gray-600">{ride.from}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                  <p className="text-xs text-gray-600">{ride.to}</p>
                </div>
              </div>

              {/* Rating + Book again */}
              <div className="flex items-center justify-between">
                <Stars count={ride.rating} />
                <button
                  onClick={() => {
                    setPickup(ride.from);
                    setDropoff(ride.to);
                    setActiveTab("book");
                  }}
                  className="text-xs text-orange-400 font-bold hover:underline"
                >
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