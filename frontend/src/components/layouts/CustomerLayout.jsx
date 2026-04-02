// layouts/CustomerLayout.jsx
import { Outlet } from "react-router-dom";
import { useCustomerProfile } from "../../hooks/profile/useCustomer";
import CustomerNavbar from "../../pages/customer/customer-comps/CustomerNavbar";
const CustomerLayout = () => {
  const { profile, loading, error, refetch } = useCustomerProfile();

  return (
    <div className="flex flex-col h-screen overflow-hidden">

      {/* Navbar gets profile as prop — no fetch inside */}
      <CustomerNavbar profile={profile} loading={loading} />

      {/* Every child route can call useOutletContext() to get profile */}
      <div className="flex-1 overflow-hidden">
        <Outlet context={{ profile, loading, error, refetch }} />
      </div>

    </div>
  );
};

export default CustomerLayout;