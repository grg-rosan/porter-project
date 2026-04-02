// hooks/useComplaints.js
import { useState, useEffect, useCallback } from "react";
import {
  fetchComplaints,
  resolveComplaint,
  blockUser, 
  unblockUser,
} from "../api/adminApi"; // all of these are not in admin api calls

// Shape backend complaint → UI shape expected by ComplaintsPanel
const shapeComplaint = (c) => ({
  id:        c.id ?? c.complaintID,
  against:   c.against?.name  ?? c.againstName ?? "Unknown",
  againstID: c.againstUserID  ?? c.against?.userID,
  role:      (c.againstRole ?? "user").toLowerCase(),
  from:      c.reporter?.name ?? c.reporterName ?? "Anonymous",
  reason:    c.reason ?? c.description ?? "",
  status:    (c.status ?? "open").toLowerCase(),
  blocked:   !!(c.against?.isBlocked ?? c.isBlocked),
  createdAt: c.createdAt
    ? new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—",
});

export const useComplaintsPanel = () => {
  const [complaints, setComplaints] = useState([]);
  const [filter,     setFilter]     = useState("all");
  const [search,     setSearch]     = useState("");
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Pass status filter to backend when it's not "all" or "blocked"
      // (blocked is a client-side derived filter)
      const statusParam =
        filter === "all" || filter === "blocked"
          ? undefined
          : filter.toUpperCase();

      const json = await fetchComplaints({ status: statusParam });
      const raw  = json.data ?? json.complaints ?? [];
      setComplaints(raw.map(shapeComplaint));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  // ── Resolve ────────────────────────────────────────────────────────────────
  const handleResolveComplaint = useCallback(async (id) => {
    try {
      await resolveComplaint(id, { status: "RESOLVED" });
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "resolved" } : c))
      );
    } catch (e) {
      alert(e.message);
    }
  }, []);

  // ── Block / Unblock ────────────────────────────────────────────────────────
  const toggleBlock = useCallback(async (complaintId) => {
    const complaint = complaints.find((c) => c.id === complaintId);
    if (!complaint?.againstID) return;

    try {
      if (complaint.blocked) {
        await unblockUser(complaint.againstID);
      } else {
        await blockUser(complaint.againstID, `Blocked via complaint #${complaintId}`);
      }
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === complaintId ? { ...c, blocked: !c.blocked } : c
        )
      );
    } catch (e) {
      alert(e.message);
    }
  }, [complaints]);

  // ── Client-side filter + search ────────────────────────────────────────────
  const filtered = complaints
    .filter((c) => {
      if (filter === "blocked")  return c.blocked;
      if (filter === "open")     return c.status === "open";
      if (filter === "resolved") return c.status === "resolved";
      return true;
    })
    .filter((c) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        c.against.toLowerCase().includes(q) ||
        c.reason.toLowerCase().includes(q)  ||
        c.from.toLowerCase().includes(q)
      );
    });

  return {
    filtered,
    filter,
    setFilter,
    search,
    setSearch,
    resolveComplaint: handleResolveComplaint,
    toggleBlock,
    loading,
    error,
    reload: load,
  };
};