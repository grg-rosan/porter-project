import { useState, useEffect, useCallback } from "react";
import {getRiderProfile } from "../../api/riderApi";

export const useRiderProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRiderProfile();
      setProfile(res.data); 
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