import { useComplaintsPanel } from "../../../hooks/useComplaints";
const Icon = ({ name, size = 20, className = "" }) => (
  <span className={`material-symbols-rounded select-none ${className}`} style={{ fontSize: size, lineHeight: 1 }}>{name}</span>
);

const FILTERS = [
  { id: "all",      label: "All" },
  { id: "open",     label: "Open" },
  { id: "resolved", label: "Resolved" },
  { id: "blocked",  label: "Blocked" },
];

export default function ComplaintsPanel() {
  const { filtered, filter, setFilter, search, setSearch, resolveComplaint, toggleBlock } = useComplaintsPanel();

  return (
    <section>
      <div className="mb-5">
        <h2 className="text-lg font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Complaints & Moderation</h2>
        <p className="text-xs text-gray-500 mt-0.5">Manage reports, block or unblock users and riders</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 flex-1">
          <Icon name="search" size={16} className="text-gray-600 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or reason…"
            className="bg-transparent text-sm text-white placeholder-gray-600 outline-none w-full"
          />
        </div>
        <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all
                ${filter === f.id ? "bg-[#F5A623] text-gray-950" : "text-gray-500 hover:text-white"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-600 text-sm">No complaints found.</div>
        )}
        {filtered.map((c) => (
          <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              {/* Role icon */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5
                ${c.role === "rider" ? "bg-sky-400/10" : "bg-purple-400/10"}`}>
                <Icon name={c.role === "rider" ? "two_wheeler" : "person"} size={16}
                  className={c.role === "rider" ? "text-sky-400" : "text-purple-400"} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-white">{c.against}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize
                    ${c.role === "rider" ? "bg-sky-400/10 text-sky-400" : "bg-purple-400/10 text-purple-400"}`}>
                    {c.role}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded
                    ${c.status === "open" ? "bg-red-400/10 text-red-400" : "bg-green-400/10 text-green-400"}`}>
                    {c.status}
                  </span>
                  {c.blocked && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-400/10 text-orange-400">
                      blocked
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">{c.reason}</p>
                <p className="text-[10px] text-gray-600 mt-1" style={{ fontFamily: "'DM Mono', monospace" }}>
                  Reported by {c.from} · {c.createdAt}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1.5 shrink-0">
                {c.status === "open" && (
                  <button
                    onClick={() => resolveComplaint(c.id)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-green-400
                               hover:bg-green-400/10 px-2 py-1 rounded-lg transition"
                  >
                    <Icon name="check" size={13} /> Resolve
                  </button>
                )}
                <button
                  onClick={() => toggleBlock(c.id)}
                  className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg transition
                    ${c.blocked
                      ? "text-orange-400 hover:bg-orange-400/10"
                      : "text-gray-500 hover:bg-gray-800 hover:text-orange-400"}`}
                >
                  <Icon name={c.blocked ? "lock_open" : "block"} size={13} />
                  {c.blocked ? "Unblock" : "Block"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}