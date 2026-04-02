// components/layoutComps/admin-comps/AdminNavbar.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalytics } from "../../../hooks/useAnalystics";
import { useAuth } from "../../../context/AuthContext";

const Icon = ({ name, size = 20, className = "" }) => (
  <span className={`material-symbols-rounded select-none ${className}`} style={{ fontSize: size, lineHeight: 1 }}>
    {name}
  </span>
);

const BASE_NAV_ITEMS = [
  { icon: "dashboard",     label: "Dashboard",    id: "dashboard"    },
  { icon: "verified_user", label: "Verification", id: "verification" },
  { icon: "gavel",         label: "Complaints",   id: "complaints"   },
  { icon: "analytics",     label: "Analytics",    id: "analytics"    },
];

/**
 * AdminNavbar
 *
 * Props:
 *   activeSection  – currently active section id
 *   onNavigate     – (sectionId: string) => void
 *   extraNavItems  – optional extra items appended to the nav
 *                    e.g. [{ icon: "tune", label: "Settings", id: "settings" }]
 */
export default function AdminNavbar({ activeSection, onNavigate, extraNavItems = [] }) {
  const { user }                        = useAuth();
  const { pendingRiders, openComplaints } = useAnalytics();
  const [mobileOpen, setMobileOpen]     = useState(false);
  const navigate                        = useNavigate();

  const NAV_ITEMS = [...BASE_NAV_ITEMS, ...extraNavItems];
  const BADGES    = { verification: pendingRiders, complaints: openComplaints };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const initials = user?.name
    ?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "A";

  return (
    <nav className="sticky top-0 z-50 w-full bg-gray-950 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-7 h-7 bg-[#F5A623] rounded flex items-center justify-center">
              <Icon name="local_taxi" size={15} className="text-gray-950" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span style={{ fontFamily: "'Syne', sans-serif" }}
                className="text-white font-extrabold text-base tracking-tight">Porter</span>
              <span style={{ fontFamily: "'DM Mono', monospace" }}
                className="text-[10px] font-medium text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded uppercase tracking-widest">
                Admin
              </span>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button key={item.id} onClick={() => onNavigate(item.id)}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${activeSection === item.id
                    ? "bg-[#F5A623] text-gray-950"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>
                <Icon name={item.icon} size={15} />
                {item.label}
                {BADGES[item.id] > 0 && (
                  <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold
                                   flex items-center justify-center
                    ${activeSection === item.id ? "bg-gray-950 text-[#F5A623]" : "bg-red-500 text-white"}`}>
                    {BADGES[item.id]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Right: user + logout */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-gray-800">
              <div className="text-right">
                <p className="text-xs font-semibold text-white leading-none">{user?.name}</p>
                <p className="text-[10px] text-gray-500 mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>
                  {user?.role}
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#F5A623] flex items-center justify-center">
                <span className="text-gray-950 font-black text-sm" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {initials}
                </span>
              </div>
              <button onClick={handleLogout}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-800 transition"
                title="Logout">
                <Icon name="logout" size={15} className="text-gray-500 hover:text-red-400" />
              </button>
            </div>

            <button onClick={() => setMobileOpen((p) => !p)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 transition">
              <Icon name={mobileOpen ? "close" : "menu"} size={20} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950 px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button key={item.id}
              onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${activeSection === item.id
                  ? "bg-[#F5A623] text-gray-950"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
              <div className="flex items-center gap-3">
                <Icon name={item.icon} size={18} />
                {item.label}
              </div>
              {BADGES[item.id] > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                  ${activeSection === item.id ? "bg-gray-950 text-[#F5A623]" : "bg-red-500 text-white"}`}>
                  {BADGES[item.id]}
                </span>
              )}
            </button>
          ))}

          <div className="pt-2 border-t border-gray-800 flex items-center justify-between px-1">
            <div>
              <p className="text-xs font-semibold text-white">{user?.name}</p>
              <p className="text-[10px] text-gray-500">{user?.role}</p>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition">
              <Icon name="logout" size={15} /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}