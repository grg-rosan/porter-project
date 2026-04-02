// hooks/useRiderVerification.js
import { useState, useEffect, useCallback } from "react";
import {
  fetchRiderVerifications,
  fetchRiderDetails, //this is not in adminApi call
  reviewRiderDocs,
} from "../api/adminApi";

// Map backend verificationStatus → UI status key
const normaliseStatus = (s = "") => s.toLowerCase();

// Shape a backend riderProfile record into what the panel expects
const shapeRider = (r) => ({
  id:          r.riderID,
  name:        r.user?.name  ?? "Unknown",
  email:       r.user?.email ?? "",
  phone:       r.phone       ?? "—",
  vehicle:     `${r.vehicle_type ?? ""} · ${r.vehicle_number ?? ""}`.trim(),
  status:      normaliseStatus(r.verificationStatus),
  submittedAt: r.createdAt
    ? new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "—",
  docs: {
    license:      !!r.license_image,
    governmentID: !!r.governmentID_image,
    vehiclePhoto: !!r.vehicle_image,
  },
  // keep raw image URLs for the detail modal
  license_image:      r.license_image,
  governmentID_image: r.governmentID_image,
  vehicle_image:      r.vehicle_image,
  verificationNote:   r.verificationNote ?? null,
});

export const useRiderVerification = () => {
  const [riders,   setRiders]   = useState([]);
  const [filter,   setFilter]   = useState("pending");
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Fetch list whenever filter changes ────────────────────────────────────
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // "all" → no status param; otherwise pass uppercase enum value
      const statusParam = filter === "all" ? undefined : filter.toUpperCase();
      const { data } = await fetchRiderVerifications(statusParam);
      setRiders((data ?? []).map(shapeRider));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  // ── Open detail modal (optionally refetch full profile) ───────────────────
  const openDetail = useCallback(async (rider) => {
    setSelected(rider); // show immediately with list data
    try {
      const { data } = await fetchRiderDetails(rider.id);
      setSelected(shapeRider(data)); // refresh with full detail
    } catch {
      // keep what we have — not critical
    }
  }, []);

  const closeDetail = useCallback(() => setSelected(null), []);

  // ── Approve ───────────────────────────────────────────────────────────────
  const handleApprove = useCallback(async (riderID) => {
    try {
      setActionLoading(true);
      await reviewRiderDocs(riderID, "VERIFIED");
      setSelected(null);
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  }, [load]);

  // ── Reject ────────────────────────────────────────────────────────────────
  const handleReject = useCallback(async (riderID, reason = "Documents did not meet requirements") => {
    try {
      setActionLoading(true);
      await reviewRiderDocs(riderID, "REJECTED", reason);
      setSelected(null);
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  }, [load]);

  // ── Filtered list (filter is already applied server-side, but keep client ─
  //    filter so switching tabs is instant while re-fetch is in progress)
  const filtered = filter === "all"
    ? riders
    : riders.filter((r) => r.status === filter);

  return {
    filtered,
    filter,
    setFilter,
    selected,
    openDetail,
    closeDetail,
    handleApprove,
    handleReject,
    loading,
    error,
    actionLoading,
    reload: load,
  };
};