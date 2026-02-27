import { VEHICLE_PRICING } from "../config/vehiclePricing.config.js";

export function calculateFare({
  distance,
  vehicle_type,
  weightKg,
  surgeMultiplier = 1,
}) {
  const vehicle = VEHICLE_PRICING[vehicle_type];
  console.log("from pricing:",vehicle)
  if (!vehicle) throw new Error("Invalid vehicle type");

  let fare = vehicle.base + distance * vehicle.perKm;

  // weight adjustment
  if (weightKg > 300) fare *= 1.2;
  if (weightKg > 700) fare *= 1.4;

  // surge
  fare *= surgeMultiplier;

  return Math.max(vehicle.minFare, Math.round(fare));
}
