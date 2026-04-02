// hooks/useAdmin.js
import { useState, useEffect, useCallback } from "react";
import { fetchDashboardStats } from "../../api/adminApi";

export const useAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchDashboardStats();
      // Matches your backend response: { status: "success", data: { ... } }
      setStats(res.data); 
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return { stats, loading, error, refetch: loadData };
};