import { useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { getAPI } from "../../api/api";
import CustomerNavbar from "../../components/layoutComps/Navbars/CustomerNavbar";
import TrackingMap from "../../components/sharedComps/TrackingMap";
import OrderFormComp from "./customerComps/OrderFormComp";
import useCustomerOrderSocket from "../../hooks/customerSocket";

export default function CustomerPage() {
  const { socket }                          = useSocket();
  const [status,        setStatus]          = useState("idle");
  const [riderLocation, setRiderLocation]   = useState(null);
  const [currentOrder,  setCurrentOrder]    = useState(null);
  const [sheetOpen,     setSheetOpen]       = useState(false);

  useCustomerOrderSocket({ setStatus, setCurrentOrder, setRiderLocation, setSheetOpen });

  const handleOrderRequest = async (formData) => {
    const data = await getAPI("customer/orders/create", "POST", formData);
    if (data.order) {
      setCurrentOrder({
        ...data.order,
        pickupLoc: JSON.parse(data.order.pickup_address),
        dropLoc:   JSON.parse(data.order.drop_address),
      });
      setStatus("pending");
    }
  };

  const handleCancelOrder = () => {
    socket.emit("order:cancel", {
      orderID: currentOrder.ID,
      riderID: currentOrder.riderID,
    });
    setStatus("idle");
    setCurrentOrder(null);
    setRiderLocation(null);
  };

  return (
    // Full-height page, no scroll on the outer shell
    <div
      className="min-h-screen bg-gray-50 flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/*
        ── Main content area ──
        flex-1 so it fills remaining height below navbar.
        The outer padding (p-6) provides the "equal padding wrapping all components"
        from the wireframe — this 20% breathing room is represented by the gap/padding.
      */}
      <main className="flex-1 p-6">
        <div className="h-full flex gap-6">

          {/*
            ── Left: Map — 40% width ──
            Uses a fixed aspect ratio on smaller screens, full height on desktop.
          */}
          <section
            className="w-[40%] shrink-0"
            style={{ minHeight: "calc(100vh - 64px - 48px)" }}
            aria-label="Tracking map"
          >
            <TrackingMap
              riderLocation={riderLocation}
              pickupLocation={currentOrder?.pickupLoc}
            />
          </section>

          {/*
            ── Right: Form — 40% width ──
            Remaining 20% is the gap + outer padding (the equal wrapping padding).
          */}
          <section
            className="w-[40%] shrink-0 bg-white rounded-2xl shadow-sm p-6 overflow-y-auto"
            style={{ minHeight: "calc(100vh - 64px - 48px)" }}
            aria-label="Order form"
          >
            <OrderFormComp onSubmit={handleOrderRequest} />
          </section>

        </div>
      </main>
    </div>
  );
}