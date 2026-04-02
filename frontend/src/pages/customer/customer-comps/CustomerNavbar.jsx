// pages/customer/customer-comps/CustomerNavbar.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NAV_LINKS = [
  { icon: "history",       label: "Request history" },
  { icon: "notifications", label: "Notifications"   },
  { icon: "settings",      label: "Settings"        },
  { icon: "help",          label: "Help"            },
  { icon: "support_agent", label: "Support"         },
];

const PROFILE_MENU = [
  { icon: "public", label: "City to City" },
  { icon: "shield", label: "Safety"       },
  { divider: true },
  { icon: "logout", label: "Logout", danger: true },
];

const Icon = ({ name, size = 20, className = "" }) => (
  <span
    className={`material-symbols-rounded select-none ${className}`}
    style={{ fontSize: size, lineHeight: 1 }}
  >
    {name}
  </span>
);

// ── Avatar: shows profile image or initials fallback ─────────────────────────
const Avatar = ({ name = "", image = null, size = "w-8 h-8", textSize = "text-sm" }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <div className={`${size} rounded-full overflow-hidden bg-[#c0392b] flex items-center justify-center shrink-0`}>
      {image ? (
        <img src={image} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className={`text-white font-bold ${textSize}`}>{initials}</span>
      )}
    </div>
  );
};

// ── Skeleton for when profile is still loading ───────────────────────────────
const ProfileSkeleton = () => (
  <div className="flex items-center gap-2 animate-pulse">
    <div className="w-8 h-8 rounded-full bg-gray-200" />
    <div className="hidden md:block space-y-1">
      <div className="h-3 w-16 bg-gray-200 rounded" />
      <div className="h-2 w-10 bg-gray-200 rounded" />
    </div>
  </div>
);

// ── Main Navbar ───────────────────────────────────────────────────────────────
// Props:
//   profile  — CustomerProfile object (with nested .user) from CustomerLayout
//   loading  — boolean, show skeleton while fetching
export default function CustomerNavbar({ profile, loading }) {
  const [profileOpen,    setProfileOpen]    = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink,     setActiveLink]     = useState(null);
  const dropdownRef = useRef(null);
  const navigate    = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Derive display values from profile prop
  const name  = profile?.user?.name  ?? "";
  const image = profile?.profileImage ?? null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleMenuAction = (item) => {
    if (item.danger) handleLogout();
    setProfileOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="w-full bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-[#F5A623] rounded-lg flex items-center justify-center">
              <Icon name="local_taxi" size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">Porter</span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => setActiveLink(link.label)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeLink === link.label
                    ? "bg-[#F5A623]/10 text-[#F5A623]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <Icon
                  name={link.icon}
                  size={18}
                  className={activeLink === link.label ? "text-[#F5A623]" : "text-gray-400"}
                />
                {link.label}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">

            {/* Desktop profile dropdown */}
            <div className="relative hidden md:block" ref={dropdownRef}>
              {loading ? (
                <ProfileSkeleton />
              ) : (
                <button
                  onClick={() => setProfileOpen((p) => !p)}
                  className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full
                             hover:bg-gray-50 border border-transparent
                             hover:border-gray-200 transition-all"
                >
                  <Avatar name={name} image={image} />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800 leading-none">
                      {name || "—"}
                    </p>
                  </div>
                  <Icon
                    name={profileOpen ? "expand_less" : "expand_more"}
                    size={18}
                    className="text-gray-400"
                  />
                </button>
              )}

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl
                                shadow-xl border border-gray-100 py-1.5 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">{name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{profile?.user?.email}</p>
                  </div>
                  {PROFILE_MENU.map((item, i) =>
                    item.divider ? (
                      <div key={i} className="my-1.5 border-t border-gray-100" />
                    ) : (
                      <button
                        key={item.label}
                        onClick={() => handleMenuAction(item)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          item.danger
                            ? "text-red-500 hover:bg-red-50"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Icon
                          name={item.icon}
                          size={18}
                          className={item.danger ? "text-red-400" : "text-gray-400"}
                        />
                        {item.label}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen((p) => !p)}
              className="md:hidden flex items-center justify-center w-9 h-9
                         rounded-lg hover:bg-gray-100 transition"
            >
              <Icon
                name={mobileMenuOpen ? "close" : "menu"}
                size={22}
                className="text-gray-600"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">

          {/* Profile row */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
            {loading ? (
              <ProfileSkeleton />
            ) : (
              <>
                <Avatar name={name} image={image} size="w-10 h-10" textSize="text-base" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{name || "—"}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{profile?.user?.email}</p>
                </div>
              </>
            )}
          </div>

          {/* Links */}
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((item) => (
              <button
                key={item.label}
                onClick={() => { setActiveLink(item.label); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm
                            font-medium transition-colors ${
                  activeLink === item.label
                    ? "bg-[#F5A623]/10 text-[#F5A623]"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon
                  name={item.icon}
                  size={20}
                  className={activeLink === item.label ? "text-[#F5A623]" : "text-gray-400"}
                />
                {item.label}
              </button>
            ))}

            <div className="border-t border-gray-100 my-2" />

            {PROFILE_MENU.map((item, i) =>
              item.divider ? (
                <div key={i} className="border-t border-gray-100 my-2" />
              ) : (
                <button
                  key={item.label}
                  onClick={() => handleMenuAction(item)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm
                              font-medium transition-colors ${
                    item.danger
                      ? "text-red-500 hover:bg-red-50"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon
                    name={item.icon}
                    size={20}
                    className={item.danger ? "text-red-400" : "text-gray-400"}
                  />
                  {item.label}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
}