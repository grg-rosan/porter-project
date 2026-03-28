import {prisma} from "./db.config.js"

 export const getFareConfig = async (vehicleType) => {
  const config = await prisma.fareConfig.findUnique({
    where: { vehicleType },
  });
  if (!config) throw new Error(`No fare config found for ${vehicleType}`);
  return config;
}; 