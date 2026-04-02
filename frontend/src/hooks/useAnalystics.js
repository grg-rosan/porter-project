// hooks/useAnalytics.js
import { useEffect, useState, useCallback } from "react";
import { fetchDashboardStats } from "../api/adminApi.js";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const useAnalytics = () => {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await fetchDashboardStats();
      setStats(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Shape the weekly rides array for the bar chart ────────────────────────
  // Backend returns: [{ day: "Mon", count: 12 }, ...]
  const weekly = stats?.weeklyRides ?? DAYS.map((d) => ({ day: d, rides: 0 }));

  // Normalise – backend uses "count", chart component expects "rides"
  const normWeekly = weekly.map((d) => ({
    day:   d.day,
    rides: d.rides ?? d.count ?? 0,
  }));
  const maxRides = Math.max(...normWeekly.map((d) => d.rides), 1);

  // Revenue formatting  (e.g. 125000 → "Rs 1.25L")
  const rawRevenue  = stats?.revenue ?? 0;
  const fmtRevenue  =
    rawRevenue >= 100_000
      ? `Rs ${(rawRevenue / 100_000).toFixed(2)}L`
      : `Rs ${rawRevenue.toLocaleString()}`;

  return {
    // stat cards
    totalRides:    stats?.totalRides   ?? 0,
    ridesChange:   stats?.ridesChange  ?? null,
    activeRiders:  stats?.activeRiders ?? 0,
    pendingRiders: stats?.pendingVerify ?? 0,
    openComplaints: stats?.openComplaints ?? 0,
    blockedUsers:  stats?.blockedUsers ?? 0,
    revenue:       fmtRevenue,
    revenueChange: stats?.revenueChange ?? null,
    // chart
    weekly:   normWeekly,
    maxRides,
    // meta
    loading,
    error,
    reload: load,
  };
};