// components/layouts/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import { useAdminDashboard } from "../../hooks/profile/useAdmin";
import AdminNavbar from "../../pages/admin/admin-comps/AdminNavbar";
const AdminLayout = () => {
  const { stats, loading, error, refetch } = useAdminDashboard();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black">
      {/* Admin Navbar */}
      <AdminNavbar stats={stats} loading={loading} />

      <div className="flex-1 overflow-auto">
        {/* Children (like AdminPage) can useOutletContext() to get stats */}
        <Outlet context={{ stats, loading, error, refetch }} />
      </div>
    </div>
  );
};

export default AdminLayout;