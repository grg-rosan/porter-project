// pages/rider/rider-comps/RiderNavbar.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VerificationModal from "../../../components/VerificationModal";
// Props:
//   profile  — RiderProfile object (with nested .user) from RiderLayout
//   loading  — boolean

const NAV_LINKS = [
  { icon: "history",       label: "Request history" },
  { icon: "notifications", label: "Notifications"   },
  { icon: "settings",      label: "Settings"        },
];

const PROFILE_MENU = [
  { icon: "public", label: "City to City" },
  { icon: "shield", label: "Safety"       },
  { divider: true },
  { icon: "logout", label: "Logout", danger: true },
];

const Icon = ({ name, size = 20, className = "" }) => (
  <span className={`material-symbols-rounded select-none ${className}`} style={{ fontSize: size, lineHeight: 1 }}>
    {name}
  </span>
);

const Avatar = ({ name = "", image = null, size = "w-8 h-8", textSize = "text-sm" }) => {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  return (
    <div className={`${size} rounded-full overflow-hidden bg-[#c0392b] flex items-center justify-center shrink-0`}>
      {image
        ? <img src={image} alt={name} className="w-full h-full object-cover" />
        : <span className={`text-white font-bold ${textSize}`}>{initials}</span>}
    </div>
  );
};

const ProfileSkeleton = () => (
  <div className="flex items-center gap-2 animate-pulse">
    <div className="w-8 h-8 rounded-full bg-gray-200" />
    <div className="hidden md:block space-y-1">
      <div className="h-3 w-16 bg-gray-200 rounded" />
      <div className="h-2 w-10 bg-gray-200 rounded" />
    </div>
  </div>
);

export default function RiderNavbar({ profile, loading }) {
  const [profileOpen,    setProfileOpen]    = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink,     setActiveLink]     = useState(null);
  const [verifyOpen,     setVerifyOpen]     = useState(false);
  const dropdownRef = useRef(null);
  const navigate    = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const name      = profile?.user?.name    ?? "";
  const image     = profile?.profileImage  ?? null;
  const rating    = profile?.rating        ?? "—";
  const vehicle   = profile?.vehicle_type  ?? "";
  const isVerified = profile?.verificationStatus === "VERIFIED";

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleMenuClick = (item) => {
    if (item.danger) handleLogout();
    setProfileOpen(false);
    setMobileMenuOpen(false);
  };

  const openVerify = () => {
    setVerifyOpen(true);
    setProfileOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <>
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

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <button key={link.label} onClick={() => setActiveLink(link.label)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeLink === link.label
                      ? "bg-[#F5A623]/10 text-[#F5A623]"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}>
                  <Icon name={link.icon} size={18}
                    className={activeLink === link.label ? "text-[#F5A623]" : "text-gray-400"} />
                  {link.label}
                </button>
              ))}
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">

              <button className="hidden md:flex items-center gap-1.5 bg-[#b5e048] hover:bg-[#a4cf3a]
                                 text-gray-800 text-xs font-bold px-4 py-2 rounded-full transition-all">
                <Icon name="drive_eta" size={16} />
                Driver mode
              </button>

              {/* Desktop dropdown */}
              <div className="relative hidden md:block" ref={dropdownRef}>
                {loading ? <ProfileSkeleton /> : (
                  <button onClick={() => setProfileOpen(p => !p)}
                    className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full
                               hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all">
                    {/* Avatar with verification dot */}
                    <div className="relative">
                      <Avatar name={name} image={image} />
                      {!isVerified && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5
                                         bg-amber-400 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-800 leading-none">{name || "—"}</p>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {[...Array(4)].map((_, i) => <Icon key={i} name="star" size={11} className="text-[#F5A623]" />)}
                        <Icon name="star_half" size={11} className="text-[#F5A623]" />
                        <span className="text-[10px] text-gray-400 ml-1">{rating}</span>
                      </div>
                    </div>
                    <Icon name={profileOpen ? "expand_less" : "expand_more"} size={18} className="text-gray-400" />
                  </button>
                )}

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">{name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{vehicle}</p>

                      {/* Verification status in dropdown */}
                      {isVerified ? (
                        <div className="mt-1.5 flex items-center gap-1">
                          <Icon name="verified" size={13} className="text-green-500" />
                          <span className="text-xs text-green-600 font-medium">Verified</span>
                        </div>
                      ) : (
                        <div className="mt-2.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Icon name="warning" size={13} className="text-amber-500" />
                            <p className="text-xs font-semibold text-amber-900">Not verified</p>
                          </div>
                          <p className="text-xs text-amber-700 leading-snug">
                            Upload your documents to start receiving orders.
                          </p>
                          <button onClick={openVerify}
                            className="mt-1.5 text-xs font-semibold text-amber-800 underline hover:text-amber-900">
                            Verify now →
                          </button>
                        </div>
                      )}
                    </div>

                    {PROFILE_MENU.map((item, i) =>
                      item.divider
                        ? <div key={i} className="my-1.5 border-t border-gray-100" />
                        : (
                          <button key={item.label} onClick={() => handleMenuClick(item)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                              item.danger ? "text-red-500 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"}`}>
                            <Icon name={item.icon} size={18} className={item.danger ? "text-red-400" : "text-gray-400"} />
                            {item.label}
                          </button>
                        )
                    )}
                  </div>
                )}
              </div>

              {/* Mobile hamburger */}
              <button onClick={() => setMobileMenuOpen(p => !p)}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 transition">
                <Icon name={mobileMenuOpen ? "close" : "menu"} size={22} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar name={name} image={image} size="w-10 h-10" textSize="text-base" />
                  {!isVerified && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3
                                     bg-amber-400 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{name || "—"}</p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {[...Array(4)].map((_, i) => <Icon key={i} name="star" size={11} className="text-[#F5A623]" />)}
                    <Icon name="star_half" size={11} className="text-[#F5A623]" />
                    <span className="text-[10px] text-gray-400 ml-1">{rating}</span>
                  </div>
                </div>
                {isVerified ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <Icon name="verified" size={15} className="text-green-500" />
                    <span className="text-xs text-green-600 font-medium">Verified</span>
                  </div>
                ) : (
                  <button onClick={openVerify}
                    className="flex items-center gap-1 text-xs bg-amber-50 border border-amber-200
                               text-amber-800 font-semibold px-2.5 py-1 rounded-full
                               hover:bg-amber-100 transition-colors shrink-0">
                    <Icon name="warning" size={13} className="text-amber-500" />
                    Not verified
                  </button>
                )}
              </div>

              {!isVerified && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                  <p className="text-xs text-amber-700 leading-snug">
                    Upload your documents to start receiving orders.
                  </p>
                  <button onClick={openVerify}
                    className="mt-1 text-xs font-semibold text-amber-800 underline hover:text-amber-900">
                    Verify now →
                  </button>
                </div>
              )}
            </div>

            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((item) => (
                <button key={item.label}
                  onClick={() => { setActiveLink(item.label); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeLink === item.label
                      ? "bg-[#F5A623]/10 text-[#F5A623]"
                      : "text-gray-600 hover:bg-gray-50"}`}>
                  <Icon name={item.icon} size={20}
                    className={activeLink === item.label ? "text-[#F5A623]" : "text-gray-400"} />
                  {item.label}
                </button>
              ))}

              <div className="border-t border-gray-100 my-2" />

              {PROFILE_MENU.map((item, i) =>
                item.divider
                  ? <div key={i} className="border-t border-gray-100 my-2" />
                  : (
                    <button key={item.label} onClick={() => handleMenuClick(item)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                        item.danger ? "text-red-500 hover:bg-red-50" : "text-gray-600 hover:bg-gray-50"}`}>
                      <Icon name={item.icon} size={20} className={item.danger ? "text-red-400" : "text-gray-400"} />
                      {item.label}
                    </button>
                  )
              )}

              <div className="pt-2">
                <button className="w-full flex items-center justify-center gap-2 bg-[#b5e048]
                                   hover:bg-[#a4cf3a] text-gray-800 font-bold py-3.5 rounded-xl text-sm transition-all">
                  <Icon name="drive_eta" size={18} />
                  Driver mode
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Verification modal — when opened from navbar */}
      <VerificationModal open={verifyOpen} onClose={() => setVerifyOpen(false)} />
    </>
  );
}