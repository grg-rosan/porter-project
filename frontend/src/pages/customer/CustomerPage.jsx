import { useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { getAPI } from "../../api/api";
import OrderFormComp from "./customerComps/OrderFormComp";
import OrderStatus from "./customerComps/OrderStatus";
import TrackingMap from "../../components/sharedComps/Map";
import useCustomerOrderSocket from "../../hooks/customerSocket";
import { useGetCoords } from "../../hooks/getCoords";

const Icon = ({ name, size = 20, className = "" }) => (
  <span
    className={`material-symbols-rounded select-none ${className}`}
    style={{ fontSize: size, lineHeight: 1 }}
  >
    {name}
  </span>
);

export default function CustomerPage() {
  const { socket }                        = useSocket();
  const [status,        setStatus]        = useState("idle");
  const [riderLocation, setRiderLocation] = useState(null);
  const [currentOrder,  setCurrentOrder]  = useState(null);
  const [sheetOpen,     setSheetOpen]     = useState(false);

  const customerCoords   = useGetCoords();
  const customerLocation = { lat: customerCoords[0], lng: customerCoords[1] };

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
      setSheetOpen(true);
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
    setSheetOpen(false);
  };

  const isOrderActive = status !== "idle";

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-100">

      {/* ── MAP — fills entire screen behind everything ── */}
      <div className="absolute inset-0 z-0">
        <TrackingMap
          customerLocation={customerLocation}
          riderLocation={riderLocation}
        />
      </div>

      {/* ── NAVBAR — glass effect floating over map ── */}
      <header
        className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 pt-10 pb-3"
        style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.96) 75%, transparent)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center">
            <Icon name="two_wheeler" size={18} className="text-white" />
          </div>
          <span className="text-base font-bold text-gray-900" style={{ fontFamily: "'Syne', sans-serif" }}>
            SawaRide
          </span>
        </div>
        <button className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center">
          <Icon name="person" size={20} className="text-gray-600" />
        </button>
      </header>

      {/* ── BOTTOM SHEET — slides up over the map ── */}
      <div
        className="absolute left-0 right-0 z-20 bg-white rounded-t-3xl shadow-2xl transition-all duration-500 ease-in-out"
        style={{ bottom: 0, height: sheetOpen ? "68%" : "88px" }}
      >

        {/* handle + toggle button */}
        <button
          className="w-full flex flex-col items-center pt-3 pb-2 focus:outline-none"
          onClick={() => setSheetOpen((o) => !o)}
        >
          <div className="w-10 h-1 rounded-full bg-gray-200 mb-3" />

          {/* collapsed state — orange pill */}
          {!sheetOpen && (
            <div className="flex items-center gap-2 bg-orange-500 text-white rounded-2xl px-6 py-3 shadow-lg shadow-orange-200">
              <Icon
                name={isOrderActive ? "local_shipping" : "add_circle"}
                size={20}
                className="text-white"
              />
              <span className="text-sm font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
                {isOrderActive ? "View Order" : "Book a Ride"}
              </span>
              <Icon name="keyboard_arrow_up" size={20} className="text-white" />
            </div>
          )}

          {/* expanded state — title row */}
          {sheetOpen && (
            <div className="w-full flex items-center justify-between px-5">
              <span
                className="text-base font-bold text-gray-900"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {isOrderActive ? "Order Status" : "New Order"}
              </span>
              <div className="flex items-center gap-1 text-gray-400">
                <Icon name="keyboard_arrow_down" size={18} />
                <span className="text-xs">Collapse</span>
              </div>
            </div>
          )}
        </button>

        {/* ── SHEET CONTENT ── */}
        {sheetOpen && (
          <div className="overflow-y-auto px-5 pb-10 h-[calc(100%-64px)]">

            {/* IDLE → show booking form */}
            {status === "idle" && (
              <OrderFormComp onSubmit={handleOrderRequest} />
            )}

            {/* ORDER ACTIVE → show status + actions */}
            {isOrderActive && (
              <div className="flex flex-col gap-4 pt-2">

                {/* colored status banner — swaps automatically as status changes */}
                <OrderStatus status={status} />

                {/* cancel — hide once delivered or cancelled */}
                {status !== "delivered" && status !== "cancelled" && (
                  <button
                    onClick={handleCancelOrder}
                    className="w-full py-3 rounded-2xl border-2 border-red-200 text-red-500 text-sm font-semibold"
                  >
                    Cancel Order
                  </button>
                )}

                {/* done button after delivery */}
                {status === "delivered" && (
                  <button
                    onClick={() => { setStatus("idle"); setSheetOpen(false); }}
                    className="w-full py-3 rounded-2xl bg-orange-500 text-white text-sm font-bold"
                  >
                    Done
                  </button>
                )}

              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}