import { useMemo } from "react";
import { useRiders } from "../context/RidersContext";
import { useComplaints } from "../context/ComplaintsContext";
const WEEKLY = [
  { day: "Mon", rides: 42 }, { day: "Tue", rides: 67 },
  { day: "Wed", rides: 55 }, { day: "Thu", rides: 89 },
  { day: "Fri", rides: 103 },{ day: "Sat", rides: 134 },
  { day: "Sun", rides: 78 },
];

export function useAnalytics() {
  const { riders } = useRiders();
  const { complaints } = useComplaints();

  const stats = useMemo(() => ({
    totalRides:      568,
    ridesChange:     "+12%",
    activeRiders:    riders.filter((r) => r.status === "approved").length,
    pendingRiders:   riders.filter((r) => r.status === "pending").length,
    openComplaints:  complaints.filter((c) => c.status === "open").length,
    blockedUsers:    complaints.filter((c) => c.blocked).length,
    revenue:         "NPR 84,200",
    revenueChange:   "+8%",
    weekly:          WEEKLY,
    maxRides:        Math.max(...WEEKLY.map((d) => d.rides)),
  }), [riders, complaints]);

  return stats;
}