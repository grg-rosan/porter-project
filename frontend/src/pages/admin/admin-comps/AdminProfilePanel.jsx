// components/layoutComps/admin-comps/AdminProfilePanel.jsx
import { useState, useEffect, useCallback } from "react";
import { fetchFareConfigs, updateFareConfig, fetchSurgeStatus, updateSurge } from "../../../api/adminApi.js";

const Icon = ({ name, size = 20, className = "" }) => (
  <span className={`material-symbols-rounded select-none ${className}`} style={{ fontSize: size, lineHeight: 1 }}>
    {name}
  </span>
);

const VEHICLE_ICONS = {
  SCOOTER:   "electric_scooter",
  BIKE:      "two_wheeler",
  VAN:       "airport_shuttle",
  MINI_TRUCK:"local_shipping",
};

// ── Fare card ─────────────────────────────────────────────────────────────────
function FareCard({ config, onSave }) {
  const [editing, setEditing] = useState(false);
  const [form,    setForm]    = useState({ ...config });
  const [saving,  setSaving]  = useState(false);

  const field = (key) => ({
    value:    form[key] ?? "",
    onChange: (e) => setForm((p) => ({ ...p, [key]: parseFloat(e.target.value) || 0 })),
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(config.vehicleType, {
        baseFare: form.baseFare,
        perKm:    form.perKm,
        perKg:    form.perKg,
        minFare:  form.minFare,
      });
      setEditing(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#F5A623]/10 flex items-center justify-center">
            <Icon name={VEHICLE_ICONS[config.vehicleType] ?? "directions_car"} size={16} className="text-[#F5A623]" />
          </div>
          <span className="text-sm font-bold text-white capitalize">
            {config.vehicleType.replace("_", " ").toLowerCase()}
          </span>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-gray-500 hover:text-[#F5A623] flex items-center gap-1 transition"
          >
            <Icon name="edit" size={13} /> Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setForm({ ...config }); setEditing(false); }}
              className="text-xs text-gray-500 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs font-semibold text-gray-950 bg-[#F5A623] hover:bg-[#e09810] px-2.5 py-1 rounded-lg transition disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Base Fare (Rs)", key: "baseFare" },
          { label: "Per Km (Rs)",    key: "perKm" },
          { label: "Per Kg (Rs)",    key: "perKg" },
          { label: "Min Fare (Rs)",  key: "minFare" },
        ].map(({ label, key }) => (
          <div key={key}>
            <p className="text-[10px] text-gray-600 mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>{label}</p>
            {editing ? (
              <input
                type="number"
                step="0.01"
                {...field(key)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-sm text-white outline-none focus:border-[#F5A623] transition"
              />
            ) : (
              <p className="text-sm font-semibold text-white">{form[key] ?? "—"}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Surge control ─────────────────────────────────────────────────────────────
function SurgeControl() {
  const [surge,   setSurge]   = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState({ isActive: false, multiplier: 1.0, reason: "" });

  const load = useCallback(async () => {
    try {
      const { data } = await fetchSurgeStatus();
      setSurge(data);
      setForm({
        isActive:   data.isActive   ?? false,
        multiplier: data.multiplier ?? 1.0,
        reason:     data.reason     ?? "",
      });
    } catch {/* non-critical */}
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data } = await updateSurge(form);
      setSurge(data);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-white">Surge Pricing</p>
          <p className="text-xs text-gray-500">Apply a multiplier during peak hours</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${form.isActive ? "bg-red-400/10 text-red-400" : "bg-gray-800 text-gray-500"}`}>
            {form.isActive ? "ACTIVE" : "OFF"}
          </span>
          {/* Toggle */}
          <button
            onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
            className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? "bg-[#F5A623]" : "bg-gray-700"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-5" : ""}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-[10px] text-gray-600 mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>Multiplier (×)</p>
          <input
            type="number" step="0.1" min="1" max="5"
            value={form.multiplier}
            onChange={(e) => setForm((p) => ({ ...p, multiplier: parseFloat(e.target.value) || 1 }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-sm text-white outline-none focus:border-[#F5A623] transition"
          />
        </div>
        <div>
          <p className="text-[10px] text-gray-600 mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>Reason</p>
          <input
            type="text"
            value={form.reason}
            placeholder="e.g. Peak hours"
            onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#F5A623] transition"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-2 rounded-xl bg-[#F5A623] text-gray-950 text-sm font-bold hover:bg-[#e09810] transition disabled:opacity-50"
      >
        {saving ? "Saving…" : "Apply Surge Settings"}
      </button>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────
export default function AdminProfilePanel() {
  const [configs,  setConfigs]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    fetchFareConfigs()
      .then(({ data }) => setConfigs(data ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveFare = async (vehicleType, data) => {
    const { data: updated } = await updateFareConfig(vehicleType, data);
    setConfigs((prev) => prev.map((c) => (c.vehicleType === vehicleType ? updated : c)));
  };

  return (
    <section>
      <div className="mb-5">
        <h2 className="text-lg font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
          Platform Settings
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">Manage fare pricing and surge multipliers</p>
      </div>

      {/* Surge */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Surge Control</p>
        <SurgeControl />
      </div>

      {/* Fare configs */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Fare Configuration</p>
        {loading && (
          <div className="text-sm text-gray-600 text-center py-10">Loading fare configs…</div>
        )}
        {error && (
          <div className="text-sm text-red-400 text-center py-10">{error}</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {configs.map((c) => (
            <FareCard key={c.vehicleType} config={c} onSave={handleSaveFare} />
          ))}
        </div>
      </div>
    </section>
  );
}