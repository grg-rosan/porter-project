// hooks/useRiderProfile.js
import { useState, useEffect } from "react";
import { getAPI } from "../api/api";

export const useRiderProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchProfile = () => {
    setLoading(true);
    getAPI("rider/profile", "GET")
      .then(data => {
        if (data.status === "success") setProfile(data.data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProfile(); }, []);

  return { profile, loading, error, refetch: fetchProfile };
};