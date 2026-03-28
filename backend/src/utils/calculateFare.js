import { prisma } from "../../config/db.config.js";

const calculateFare = async ({ distance_km, weight_kg, vehicle_type, duration_min }) => {
  const config = await prisma.fareConfig.findUnique({
    where: { vehicleType: vehicle_type },
  });
  if (!config) throw new Error(`No fare config found for ${vehicle_type}`);

  const distance_charge = distance_km * config.perKm;
  const weight_charge   = weight_kg   * config.perKg;
  const raw_fare        = config.baseFare + distance_charge + weight_charge;

  const surge_multiplier = distance_km > 10 ? 1.3 : 1.0;

  const final_fare = Math.max(
    Math.round(raw_fare * surge_multiplier),
    config.minFare
  );

  return {
    fare: final_fare,
    breakdown: {
      base:     config.baseFare,
      distance: Math.round(distance_charge),
      weight:   Math.round(weight_charge),
      surge:    surge_multiplier > 1 ? "30%" : null,
    },
    distance_km: Math.round(distance_km * 10) / 10,
    eta_min:     Math.round(duration_min),
  };
};

export default calculateFare;