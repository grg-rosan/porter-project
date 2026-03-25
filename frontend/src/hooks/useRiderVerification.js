import { useState } from "react";
import { useRiders } from "../context/RidersContext";
export function useRiderVerification() {
  const { riders, approveRider, rejectRider } = useRiders();
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("pending");

  const filtered = riders.filter((r) =>
    filter === "all" ? true : r.status === filter
  );

  const openDetail = (rider) => setSelected(rider);
  const closeDetail = () => setSelected(null);

  const handleApprove = (id) => { approveRider(id); closeDetail(); };
  const handleReject  = (id) => { rejectRider(id);  closeDetail(); };

  return { filtered, filter, setFilter, selected, openDetail, closeDetail, handleApprove, handleReject };
}