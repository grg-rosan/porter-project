import { useState, useEffect, useCallback } from "react";
import {  getCustomerProfile } from "../../api/customerApi";

export const useCustomerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCustomerProfile();
      // Adjusting to your backend's specific "data.data.profile" structure
      setProfile(res.data?.profile || res.data); 
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { getProfile(); }, [getProfile]);

  return { profile, loading, error, refetch: getProfile };
};