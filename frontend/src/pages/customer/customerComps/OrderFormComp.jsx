import { useState } from "react";
import useFareEstimate from "../../../hooks/useFareEstimate";

const VEHICLE_TYPES = ["Bike", "Moto Fix", "Ride", "City2City"];

const Icon = ({ name, size = 20, className = "" }) => (
  <span
    className={`material-symbols-rounded select-none ${className}`}
    style={{ fontSize: size, lineHeight: 1 }}
  >
    {name}
  </span>
);

const inputClass =
  "w-full bg-white rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 border border-gray-100 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition";

export default function OrderFormComp({ onSubmit }) {
  const [pickup,  setPickup]  = useState("");
  const [dropoff, setDropoff] = useState("");
  const [weight,  setWeight]  = useState("");
  const [vehicle, setVehicle] = useState(VEHICLE_TYPES[0]);

  const allFilled = pickup.trim() && dropoff.trim() && weight.trim();
  const { estimate, estimating, error } = useFareEstimate(pickup, dropoff, weight, vehicle, allFilled);

  const handleSwap = () => {
    setPickup(dropoff);
    setDropoff(pickup);
  };

  const handleBook = () => {
    if (!allFilled) return;
    onSubmit?.({
      pickup_address: pickup,
      drop_address:   dropoff,
      weight_kg:      parseFloat(weight),
      vehicle_type:   vehicle.toUpperCase(),
    });
    setPickup("");
    setDropoff("");
    setWeight("");
    setVehicle(VEHICLE_TYPES[0]);
  };

  return (
    <div
      className="flex flex-col gap-4 h-full overflow-y-auto"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Heading */}
      <div>
        <h2
          className="text-xl font-bold text-gray-900"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Book a delivery
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">Fast, reliable, tracked</p>
      </div>

      {/* Location inputs */}
      <div className="bg-gray-50 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-1 shrink-0" aria-hidden="true">
            <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-sm" />
            <div className="w-px h-5 bg-gray-300" />
            <div className="w-3 h-3 rounded-full bg-red-400 border-2 border-white shadow-sm" />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <input
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="Pickup location"
              aria-label="Pickup location"
              className={inputClass}
              style={{ fontFamily: "inherit" }}
            />
            <input
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              placeholder="Where to?"
              aria-label="Drop-off location"
              className={inputClass}
              style={{ fontFamily: "inherit" }}
            />
          </div>
          <button
            onClick={handleSwap}
            aria-label="Swap pickup and drop-off"
            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition shrink-0"
          >
            <Icon name="swap_vert" size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Weight */}
      <div className="bg-gray-50 rounded-2xl p-4">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">
          Package weight
        </p>
        <div className="relative">
          <Icon name="scale" size={16} className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="number"
            min="0"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Enter weight"
            aria-label="Package weight in kilograms"
            className={`${inputClass} pl-9 pr-14`}
            style={{ fontFamily: "inherit" }}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
            kg
          </span>
        </div>
      </div>

      {/* Vehicle type */}
      <div>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2 px-1">
          Vehicle type
        </p>
        <div className="grid grid-cols-2 gap-2">
          {VEHICLE_TYPES.map((type) => {
            const isActive = vehicle === type;
            return (
              <button
                key={type}
                onClick={() => setVehicle(type)}
                aria-pressed={isActive}
                className={`py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  isActive
                    ? "border-orange-400 bg-orange-50 text-orange-500"
                    : "border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200"
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fare estimate */}
      {(estimating || estimate || error) && (
        <div
          className={`rounded-2xl p-4 border transition-colors ${
            error ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200"
          }`}
        >
          {error ? (
            <div className="flex items-center gap-2 text-red-500">
              <Icon name="error_outline" size={16} />
              <p className="text-sm">{error}</p>
            </div>
          ) : estimating ? (
            <p className="text-sm text-gray-400 animate-pulse">Calculating fare…</p>
          ) : (
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                  Estimated fare
                </p>
                <p
                  className="text-2xl font-extrabold text-gray-900"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Rs {estimate.fare}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {vehicle} · {estimate.distance_km} km · {weight} kg · ETA {estimate.eta}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Book button */}
      <button
        onClick={handleBook}
        disabled={!allFilled}
        aria-disabled={!allFilled}
        className={`w-full py-4 rounded-2xl text-sm font-bold transition-all mt-auto ${
          allFilled
            ? "bg-orange-400 text-white shadow-md hover:bg-orange-500 hover:-translate-y-0.5"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        {allFilled ? `Book ${vehicle}` : "Fill in all fields to book"}
      </button>
    </div>
  );
}