import { useAnalytics } from "../../../hooks/useAnalystics";
const Icon = ({ name, size = 20, className = "" }) => (
  <span className={`material-symbols-rounded select-none ${className}`} style={{ fontSize: size, lineHeight: 1 }}>{name}</span>
);

const StatCard = ({ icon, label, value, sub, accent }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon name={icon} size={16} className="text-gray-950" />
      </div>
      {sub && <span className="text-[11px] font-semibold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">{sub}</span>}
    </div>
    <div>
      <p className="text-2xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
);

export default function AnalyticsPanel() {
  const { totalRides, ridesChange, activeRiders, pendingRiders, openComplaints, blockedUsers, revenue, revenueChange, weekly, maxRides } = useAnalytics();

  return (
    <section>
      <div className="mb-5">
        <h2 className="text-lg font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Overview</h2>
        <p className="text-xs text-gray-500 mt-0.5">Platform-wide statistics at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon="route"           label="Total Rides"      value={totalRides}    sub={ridesChange}    accent="bg-[#F5A623]" />
        <StatCard icon="payments"        label="Revenue"          value={revenue}       sub={revenueChange}  accent="bg-emerald-400" />
        <StatCard icon="two_wheeler"     label="Active Riders"    value={activeRiders}                       accent="bg-sky-400" />
        <StatCard icon="pending_actions" label="Pending Verify"   value={pendingRiders}                      accent="bg-amber-400" />
      </div>

      {/* Bar chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-bold text-white">Weekly Rides</p>
            <p className="text-xs text-gray-500">This week vs target</p>
          </div>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-lg" style={{ fontFamily: "'DM Mono', monospace" }}>
            {weekly.reduce((a, d) => a + d.rides, 0)} total
          </span>
        </div>
        <div className="flex items-end gap-2 h-32">
          {weekly.map((d) => {
            const pct = Math.round((d.rides / maxRides) * 100);
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[9px] text-gray-600 group-hover:text-[#F5A623] transition" style={{ fontFamily: "'DM Mono', monospace" }}>
                  {d.rides}
                </span>
                <div className="w-full relative" style={{ height: "96px" }}>
                  <div
                    className="absolute bottom-0 w-full bg-gray-800 rounded-t-md group-hover:bg-[#F5A623]/20 transition-all duration-300"
                    style={{ height: "100%" }}
                  />
                  <div
                    className="absolute bottom-0 w-full bg-[#F5A623] rounded-t-md transition-all duration-500"
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-600" style={{ fontFamily: "'DM Mono', monospace" }}>{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
            <Icon name="report" size={18} className="text-red-400" />
          </div>
          <div>
            <p className="text-xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>{openComplaints}</p>
            <p className="text-xs text-gray-500">Open complaints</p>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
            <Icon name="block" size={18} className="text-orange-400" />
          </div>
          <div>
            <p className="text-xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>{blockedUsers}</p>
            <p className="text-xs text-gray-500">Blocked users</p>
          </div>
        </div>
      </div>
    </section>
  );
}