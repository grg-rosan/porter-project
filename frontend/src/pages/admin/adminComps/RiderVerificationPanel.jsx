import { useRiderVerification } from "../../../hooks/useRiderVerification";
const Icon = ({ name, size = 20, className = "" }) => (
  <span className={`material-symbols-rounded select-none ${className}`} style={{ fontSize: size, lineHeight: 1 }}>{name}</span>
);

const STATUS_STYLES = {
  pending:  "bg-amber-400/10 text-amber-400 border-amber-400/20",
  approved: "bg-green-400/10 text-green-400 border-green-400/20",
  rejected: "bg-red-400/10  text-red-400  border-red-400/20",
};

const FILTERS = ["pending", "approved", "rejected", "all"];

export default function RiderVerificationPanel() {
  const { filtered, filter, setFilter, selected, openDetail, closeDetail, handleApprove, handleReject } = useRiderVerification();

  return (
    <section>
      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Rider Verification</h2>
          <p className="text-xs text-gray-500 mt-0.5">Review and approve rider applications</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all
                ${filter === f ? "bg-[#F5A623] text-gray-950" : "text-gray-500 hover:text-white"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-600 text-sm">No riders found.</div>
        )}
        {filtered.map((rider) => (
          <div
            key={rider.id}
            onClick={() => openDetail(rider)}
            className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4
                       flex items-center gap-4 cursor-pointer transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center shrink-0 font-black text-white text-sm" style={{ fontFamily: "'Syne', sans-serif" }}>
              {rider.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{rider.name}</p>
              <p className="text-xs text-gray-500 truncate">{rider.vehicle}</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Doc completeness */}
              <div className="hidden sm:flex items-center gap-1">
                {Object.entries(rider.docs).map(([key, ok]) => (
                  <div key={key} title={key} className={`w-2 h-2 rounded-full ${ok ? "bg-green-400" : "bg-red-400"}`} />
                ))}
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${STATUS_STYLES[rider.status]}`}>
                {rider.status}
              </span>
              <span className="text-xs text-gray-600" style={{ fontFamily: "'DM Mono', monospace" }}>{rider.submittedAt}</span>
              <Icon name="chevron_right" size={16} className="text-gray-700 group-hover:text-gray-400 transition" />
            </div>
          </div>
        ))}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center" onClick={closeDetail}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full sm:max-w-md bg-gray-950 border border-gray-800 sm:rounded-2xl rounded-t-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Rider Details</h3>
              <button onClick={closeDetail} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-800 transition">
                <Icon name="close" size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-800">
              <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center font-black text-white text-xl" style={{ fontFamily: "'Syne', sans-serif" }}>
                {selected.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="font-bold text-white">{selected.name}</p>
                <p className="text-xs text-gray-500">{selected.phone}</p>
                <p className="text-xs text-gray-500 mt-0.5">{selected.vehicle}</p>
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Documents</p>
              <div className="space-y-2">
                {Object.entries(selected.docs).map(([key, ok]) => (
                  <div key={key} className="flex items-center justify-between py-2 border-b border-gray-900">
                    <span className="text-sm text-gray-300 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${ok ? "text-green-400" : "text-red-400"}`}>
                      <Icon name={ok ? "check_circle" : "cancel"} size={15} />
                      {ok ? "Uploaded" : "Missing"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selected.status === "pending" ? (
              <div className="flex gap-3">
                <button
                  onClick={() => handleReject(selected.id)}
                  className="flex-1 py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selected.id)}
                  className="flex-1 py-2.5 rounded-xl bg-[#F5A623] text-gray-950 text-sm font-bold hover:bg-[#e09810] transition"
                >
                  Approve
                </button>
              </div>
            ) : (
              <div className={`text-center py-2.5 rounded-xl text-sm font-bold ${STATUS_STYLES[selected.status]}`}>
                {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}