import { createContext, useContext, useState } from "react";

const RidersContext = createContext(null);

const MOCK_RIDERS = [
  { id: 1, name: "Bikash Thapa",    phone: "9841000001", status: "pending",  vehicle: "Honda Dio • BA 12 PA 3421", submittedAt: "2025-07-01", docs: { license: true, citizenshipId: true, vehicleRegistration: true } },
  { id: 2, name: "Suman Karki",     phone: "9841000002", status: "pending",  vehicle: "TVS Apache • BA 1 CHA 7890", submittedAt: "2025-07-02", docs: { license: true, citizenshipId: false, vehicleRegistration: true } },
  { id: 3, name: "Priya Shrestha",  phone: "9841000003", status: "approved", vehicle: "Bajaj Pulsar • BA 2 KHA 1122", submittedAt: "2025-06-28", docs: { license: true, citizenshipId: true, vehicleRegistration: true } },
  { id: 4, name: "Dipesh Maharjan", phone: "9841000004", status: "rejected", vehicle: "Yamaha FZ • BA 3 GA 5566", submittedAt: "2025-06-30", docs: { license: false, citizenshipId: true, vehicleRegistration: false } },
  { id: 5, name: "Anita Tamang",    phone: "9841000005", status: "pending",  vehicle: "Hero Splendor • BA 4 GHA 9900", submittedAt: "2025-07-03", docs: { license: true, citizenshipId: true, vehicleRegistration: true } },
];

export function RidersProvider({ children }) {
  const [riders, setRiders] = useState(MOCK_RIDERS);

  const approveRider = (id) =>
    setRiders((prev) => prev.map((r) => r.id === id ? { ...r, status: "approved" } : r));

  const rejectRider = (id) =>
    setRiders((prev) => prev.map((r) => r.id === id ? { ...r, status: "rejected" } : r));

  return (
    <RidersContext.Provider value={{ riders, approveRider, rejectRider }}>
      {children}
    </RidersContext.Provider>
  );
}

export const useRiders = () => useContext(RidersContext);