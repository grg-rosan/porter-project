import { useState, useEffect, useRef, useCallback } from "react";
import { getAPI } from "../api/api";
const DEBOUNCE_DELAY_MS = 600;

const useFareEstimate = (pickup, dropoff, weight, vehicle, allFilled) => {
  const [estimate,   setEstimate]   = useState(null);
  const [estimating, setEstimating] = useState(false);
  const [error,      setError]      = useState(null);
  const timerRef = useRef(null);

  const fetchEstimate = useCallback(async () => {
    setEstimating(true);
    setError(null);
    try {
      const data = await getAPI("customer/orders/estimate", "POST", {
        pickup_address: pickup,
        drop_address:   dropoff,
        weight_kg:      parseFloat(weight),
        vehicle_type:   vehicle.toUpperCase(),
      });
      setEstimate(data.estimate);
    } catch {
      setError("Could not fetch estimate. Please try again.");
      setEstimate(null);
    } finally {
      setEstimating(false);
    }
  }, [pickup, dropoff, weight, vehicle]);

  useEffect(() => {
    if (!allFilled) {
      setEstimate(null);
      setError(null);
      return;
    }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(fetchEstimate, DEBOUNCE_DELAY_MS);
    return () => clearTimeout(timerRef.current);
  }, [allFilled, fetchEstimate]);

  return { estimate, estimating, error };
};

export default useFareEstimate;