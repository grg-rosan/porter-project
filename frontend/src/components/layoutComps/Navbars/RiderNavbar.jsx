import { useState, useRef, useEffect } from "react";

const NAV_LINKS = [
  { icon: "location_city", label: "City" },
  { icon: "history", label: "Request history" },
  { icon: "notifications", label: "Notifications" },
  { icon: "settings", label: "Settings" },
  { icon: "help", label: "Help" },
  { icon: "support_agent", label: "Support" },
];

const PROFILE_MENU = [
  { icon: "local_shipping", label: "Couriers" },
  { icon: "public", label: "City to City" },
  { icon: "inventory_2", label: "Freight" },
  { icon: "shield", label: "Safety" },
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

export default function RiderNavbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("City");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"
        rel="stylesheet"
      />

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
              {/* Driver mode — desktop only */}
              <button className="hidden md:flex items-center gap-1.5 bg-[#b5e048] hover:bg-[#a4cf3a] text-gray-800 text-xs font-bold px-4 py-2 rounded-full transition-all">
                <Icon name="drive_eta" size={16} />
                Driver mode
              </button>

              {/* Desktop profile dropdown */}
              <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen((p) => !p)}
                  className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-[#c0392b] flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm">R</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800 leading-none">Roshan</p>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {[...Array(4)].map((_, i) => (
                        <Icon key={i} name="star" size={11} className="text-[#F5A623]" />
                      ))}
                      <Icon name="star_half" size={11} className="text-[#F5A623]" />
                      <span className="text-[10px] text-gray-400 ml-1">4.8</span>
                    </div>
                  </div>
                  <Icon name={profileOpen ? "expand_less" : "expand_more"} size={18} className="text-gray-400" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">Roshan</p>
                      <p className="text-xs text-gray-400 mt-0.5">View profile →</p>
                    </div>
                    {PROFILE_MENU.map((item, i) =>
                      item.divider ? (
                        <div key={i} className="my-1.5 border-t border-gray-100" />
                      ) : (
                        <button
                          key={item.label}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                            item.danger ? "text-red-500 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"
                          }`}
                          onClick={() => setProfileOpen(false)}
                        >
                          <Icon name={item.icon} size={18} className={item.danger ? "text-red-400" : "text-gray-400"} />
                          {item.label}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Mobile: avatar + expand arrow + close */}
{/* Mobile hamburger only */}
              <button
                onClick={() => setMobileMenuOpen((p) => !p)}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 transition"
              >
                <Icon name={mobileMenuOpen ? "close" : "menu"} size={22} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">

            {/* Profile row at top */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-[#c0392b] flex items-center justify-center shrink-0">
                <span className="text-white font-bold">R</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Roshan</p>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {[...Array(4)].map((_, i) => (
                    <Icon key={i} name="star" size={11} className="text-[#F5A623]" />
                  ))}
                  <Icon name="star_half" size={11} className="text-[#F5A623]" />
                  <span className="text-[10px] text-gray-400 ml-1">4.8 (0)</span>
                </div>
              </div>
            </div>

            {/* All links in one list */}
            <div className="px-4 py-3 space-y-1">
              {/* Nav links */}
              {NAV_LINKS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => { setActiveLink(item.label); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeLink === item.label
                      ? "bg-[#F5A623]/10 text-[#F5A623]"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon name={item.icon} size={20} className={activeLink === item.label ? "text-[#F5A623]" : "text-gray-400"} />
                  {item.label}
                </button>
              ))}

              {/* Divider */}
              <div className="border-t border-gray-100 my-2" />

              {/* Profile menu links */}
              {PROFILE_MENU.map((item, i) =>
                item.divider ? (
                  <div key={i} className="border-t border-gray-100 my-2" />
                ) : (
                  <button
                    key={item.label}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      item.danger ? "text-red-500 hover:bg-red-50" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon name={item.icon} size={20} className={item.danger ? "text-red-400" : "text-gray-400"} />
                    {item.label}
                  </button>
                )
              )}

              {/* Driver mode */}
              <div className="pt-2">
                <button className="w-full flex items-center justify-center gap-2 bg-[#b5e048] hover:bg-[#a4cf3a] text-gray-800 font-bold py-3.5 rounded-xl text-sm transition-all">
                  <Icon name="drive_eta" size={18} />
                  Driver mode
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}