const VehicleInfoForm = ({ vehicle, onChange }) => (
  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
      Vehicle Information
    </h2>

    <div className="mb-4">
      <label className="text-xs text-gray-500 font-bold mb-2 block uppercase">Vehicle Type</label>
      <div className="flex gap-2">
        {["bike", "scooter", "van", "mini truck"].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange("type", type)}
            className={`flex-1 py-2.5 rounded-lg border text-xs font-bold capitalize transition-all
              ${vehicle.type === type
                ? "border-blue-500 bg-blue-50 text-blue-600 shadow-sm"
                : "border-gray-100 text-gray-400 hover:border-blue-200"}`}
          >
            {type}
          </button>
        ))}
      </div>
    </div>

    <div className="space-y-3">
      <div>
        <label className="text-xs text-gray-500 font-bold mb-1 block uppercase">Plate Number</label>
        <input
          type="text"
          placeholder="e.g. BA 1 CHA 1234"
          value={vehicle.plateNumber || ""}
          onChange={(e) => onChange("plateNumber", e.target.value)}
          className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 font-bold mb-1 block uppercase">Vehicle Model</label>
        <input
          type="text"
          placeholder="e.g. Honda CB Shine"
          value={vehicle.model || ""}
          onChange={(e) => onChange("model", e.target.value)}
          className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
        />
      </div>
    </div>
  </div>
);

export default VehicleInfoForm;