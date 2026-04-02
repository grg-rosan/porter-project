// layouts/RiderLayout.jsx
import { Outlet } from "react-router-dom";
import { useRiderProfile } from "../../hooks/profile/useRiderProfile";
import RiderNavbar from "../../pages/rider/rider-comps/RiderNavbar";
const RiderLayout = () => {
  const { profile, loading, refetch } = useRiderProfile();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <RiderNavbar profile={profile} loading={loading} />
      <div className="flex-1 overflow-hidden">
        <Outlet context={{ profile, loading, refetch }} />
      </div>
    </div>
  );
};

export default RiderLayout;