// hooks/useCustomerProfile.js
import { useState, useEffect } from "react";
import { getAPI } from "../api/api";

export const useCustomerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    getAPI("customer/profile", "GET")
      .then(data => {
        if (data.status === "success") setProfile(data.data.profile);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // expose a way to refresh after profile update
  const refetch = () => {
    setLoading(true);
    getAPI("customer/profile", "GET")
      .then(data => {
        if (data.status === "success") setProfile(data.data.profile);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  return { profile, loading, error, refetch };
};