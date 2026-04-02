// pages/AdminPage.jsx  (replaces the old AdminPage)
import { useState, Suspense } from "react";
import AdminNavbar           from "./admin-comps/AdminNavbar";
import AnalyticsPanel        from "./admin-comps/AnalyticsPanel";
import RiderVerificationPanel from "./admin-comps/RiderVerificationPanel";
import ComplaintsPanel       from "./admin-comps/ComplaintsPanel";
import AdminProfilePanel from "./admin-comps/AdminProfilePanel";
// ── Thin loading skeleton shown while a panel mounts ─────────────────────────
function PanelSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-6 w-48 bg-gray-800 rounded-lg" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-gray-900 border border-gray-800 rounded-xl" />
        ))}
      </div>
      <div className="h-48 bg-gray-900 border border-gray-800 rounded-xl" />
    </div>
  );
}

// ── Section registry ──────────────────────────────────────────────────────────
// Both "dashboard" and "analytics" render AnalyticsPanel so the nav badge logic
// in AdminNavbar (pendingRiders / openComplaints) keeps working with real data.
const SECTIONS = {
  dashboard:    <AnalyticsPanel />,
  analytics:    <AnalyticsPanel />,
  verification: <RiderVerificationPanel />,
  complaints:   <ComplaintsPanel />,
  settings:     <AdminProfilePanel />,
};

// ── NAV_ITEMS extended with settings ─────────────────────────────────────────
// AdminNavbar already accepts an `onNavigate` prop; we just add "settings" here
// and pass an updated NAV_ITEMS via prop so AdminNavbar stays DRY.
// If you prefer not to touch AdminNavbar, uncomment the standalone settings tab below.

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Pass extraNavItems so AdminNavbar can render the Settings button */}
      <AdminNavbar
        activeSection={activeSection}
        onNavigate={setActiveSection}
        extraNavItems={[{ icon: "tune", label: "Settings", id: "settings" }]}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<PanelSkeleton />}>
          {SECTIONS[activeSection] ?? <AnalyticsPanel />}
        </Suspense>
      </main>
    </div>
  );
}