import { useState } from "react";
import { RidersProvider } from "../../context/RidersContext";
import { ComplaintsProvider } from "../../context/ComplaintsContext";
import AdminNavbar from "./admin-comps/AdminNavbar";
import AnalyticsPanel from "./admin-comps/AnalyticsPanel";
import RiderVerificationPanel from "./admin-comps/RiderVerificationPanel";
import ComplaintsPanel from "./admin-comps/ComplaintsPanel";

const SECTIONS = {
  dashboard:    <AnalyticsPanel />,
  analytics:    <AnalyticsPanel />,
  verification: <RiderVerificationPanel />,
  complaints:   <ComplaintsPanel />,
};

function AdminDashboardInner() {
  const [activeSection, setActiveSection] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-950">
      <AdminNavbar activeSection={activeSection} onNavigate={setActiveSection} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {SECTIONS[activeSection]}
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RidersProvider>
      <ComplaintsProvider>
        <AdminDashboardInner />
      </ComplaintsProvider>
    </RidersProvider>
  );
}