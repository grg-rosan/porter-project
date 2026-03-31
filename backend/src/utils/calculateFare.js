import { prisma } from "../config/db.config.js";
import AppError from "./AppError.js";
import { getSurgeMultiplierService } from "../services/surge.service.js";

export const calculateFare = async ({ distance_km, vehicle_type, weight_kg }) => {
  const fareConfig = await prisma.fareConfig.findUnique({
    where: { vehicleType: vehicle_type },
  });
  if (!fareConfig) throw new AppError("Fare config not found", 404);

  const surgeMultiplier = await getSurgeMultiplierService();

  const rawFare =
    fareConfig.baseFare +
    fareConfig.perKm * distance_km +
    fareConfig.perKg * weight_kg;

  const estimatedFare = Math.max(rawFare, fareConfig.minFare);
  const finalFare = parseFloat((estimatedFare * surgeMultiplier).toFixed(2));

  return { estimatedFare, surgeMultiplier, finalFare };
};