// pages/rider/RiderPage.jsx
import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { getAPI } from "../../api/api";
import { useRiderOrder } from "../../hooks/useRiderOrder";
import { useRiderMap }   from "../../hooks/useRiderMap";
import JobControls       from "./rider-comps/JobControls";
import TrackingMap       from "../../components/map-comp/Map";
import OrderCard         from "./rider-comps/OrderCard";
import VerificationModal from "../../components/VerificationModal";

const VERIFICATION_BANNERS = {
  UNVERIFIED: {
    bg: "bg-red-50 border-red-200",
    icon: "warning", iconColor: "text-red-500",
    title: "Verification Required",
    message: "Submit your documents to start accepting orders.",
    actionLabel: "Submit Documents", showAction: true,
  },
  PENDING: {
    bg: "bg-amber-50 border-amber-200",
    icon: "schedule", iconColor: "text-amber-500",
    title: "Under Review",
    message: "Your documents are being reviewed. We'll notify you once approved.",
    showAction: false,
  },
  REJECTED: {
    bg: "bg-red-50 border-red-200",
    icon: "cancel", iconColor: "text-red-500",
    title: "Verification Rejected",
    message: "Your documents were rejected. Please resubmit with valid documents.",
    actionLabel: "Resubmit Documents", showAction: true,
  },
};

const VerificationBanner = ({ status, onAction }) => {
  const config = VERIFICATION_BANNERS[status];
  if (!config) return null;
  return (
    <div className={`flex items-start gap-3 border rounded-xl p-3 ${config.bg}`}>
      <span className={`material-symbols-rounded mt-0.5 flex-shrink-0 ${config.iconColor}`} style={{ fontSize: 20 }}>
        {config.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{config.title}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{config.message}</p>
      </div>
      {config.showAction && (
        <button onClick={onAction}
          className="flex-shrink-0 text-xs font-semibold bg-white border border-gray-200
                     text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
          {config.actionLabel}
        </button>
      )}
    </div>
  );
};

const RiderPage = () => {
  // Profile from RiderLayout — no fetch here
  const { profile, refetch } = useOutletContext();

  const [isAvailable,   setIsAvailable]   = useState(profile?.isAvailable ?? false);
  const [togglingAvail, setTogglingAvail] = useState(false);
  const [verifyOpen,    setVerifyOpen]    = useState(false);
  const [availError,    setAvailError]    = useState(null);

  const { order, jobStatus, handleAccept, handleReject,
          handleStatusUpdate, emitLocation, setAvailability } = useRiderOrder();

  const { myLocation, pickupLocation, dropLocation, mapLabel } = useRiderMap({
    order, jobStatus, onLocationEmit: emitLocation,
  });

  const handleVerifySuccess = () => {
    setVerifyOpen(false);
    refetch(); // updates Navbar badge + banner in one call
  };

  const toggleAvailability = async () => {
    if (togglingAvail) return;
    const verStatus = profile?.verificationStatus;
    if (!isAvailable && verStatus !== "VERIFIED") {
      setAvailError(verStatus === "PENDING"
        ? "You can't go online while your documents are under review."
        : "Complete document verification before going online.");
      setTimeout(() => setAvailError(null), 4000);
      return;
    }
    const newStatus = !isAvailable;
    setTogglingAvail(true);
    try {
      await getAPI("rider/availability", "PATCH", { isAvailable: newStatus });
      setIsAvailable(newStatus);
      setAvailability(newStatus);
      setAvailError(null);
    } catch (err) {
      setAvailError(err.message ?? "Could not update availability.");
      setTimeout(() => setAvailError(null), 4000);
    } finally {
      setTogglingAvail(false);
    }
  };

  const verStatus  = profile?.verificationStatus;
  const isVerified = verStatus === "VERIFIED";
  const needsBanner = verStatus && verStatus !== "VERIFIED";

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-none h-[45vh] relative">
          <TrackingMap riderLocation={myLocation} pickupLocation={pickupLocation} dropLocation={dropLocation} />
          {mapLabel && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000]
                            bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full
                            shadow-lg text-sm font-semibold text-gray-800">
              {mapLabel}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
          {needsBanner && <VerificationBanner status={verStatus} onAction={() => setVerifyOpen(true)} />}

          {profile && (
            <div className="flex justify-between items-center border border-gray-100 p-3 rounded-xl shadow-sm">
              <div>
                <p className="font-bold text-gray-900">{profile.user?.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{profile.vehicle_type}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <button onClick={toggleAvailability}
                  disabled={togglingAvail || !isVerified}
                  title={!isVerified ? "Verify your account to go online" : undefined}
                  className={`px-4 py-2 rounded-lg text-white text-sm font-semibold
                              transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                              ${isAvailable ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 hover:bg-gray-500"}`}>
                  {togglingAvail ? "..." : isAvailable ? "🟢 Online" : "⚫ Offline"}
                </button>
                {availError && <p className="text-xs text-red-500 text-right max-w-[160px] leading-tight">{availError}</p>}
              </div>
            </div>
          )}

          {!order && (
            <div className="text-center text-gray-400 mt-10">
              <p className="text-4xl mb-2">🛵</p>
              <p className="text-sm">
                {!isVerified ? "Complete verification to start working"
                  : isAvailable ? "Waiting for orders..." : "You are offline"}
              </p>
            </div>
          )}

          {order && jobStatus === "incoming" && (
            <OrderCard order={order} onAccept={handleAccept} onReject={handleReject} />
          )}
          {order && jobStatus !== "incoming" && (
            <JobControls status={jobStatus} order={order} onUpdateStatus={handleStatusUpdate} />
          )}
        </div>
      </div>

      <VerificationModal open={verifyOpen} onClose={handleVerifySuccess} />
    </>
  );
};

export default RiderPage;