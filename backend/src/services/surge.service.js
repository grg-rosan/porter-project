import { prisma } from "../config/db.config.js";
import { SURGE_FALLBACK } from "../config/surge.config.js";
import AppError from "../utils/AppError.js";

export const getSurgeMultiplierService = async () => {
  try {
    const config = await prisma.surgeConfig.findUnique({ where: { id: 1 } });
    if (config?.isActive) return config.multiplier; // admin override wins

    const [pendingOrders, availableRiders] = await Promise.all([
      prisma.order.count({ where: { order_status: "PENDING" } }),
      prisma.riderProfile.count({ where: { isAvailable: true } }),
    ]);

    if (availableRiders === 0) return 2.0;

    const ratio = pendingOrders / availableRiders;
    if (ratio >= 3) return 1.8;
    if (ratio >= 2) return 1.5;
    if (ratio >= 1) return 1.2;
    return 1.0;

  } catch (err) {
    console.log("Surge calculation failed, using fallback:", err.message);
    return SURGE_FALLBACK.multiplier;
  }
};

export const getSurgeStatusService = async () => {
  try {
    return await prisma.surgeConfig.findUnique({ where: { id: 1 } }) ?? SURGE_FALLBACK;
  } catch {
    return SURGE_FALLBACK;
  }
};

export const updateSurgeService = async ({ isActive, multiplier, reason }) => {
  if (isActive && (!multiplier || multiplier < 1)) {
    throw new AppError("Multiplier must be >= 1 when activating surge", 400);
  }

  return await prisma.surgeConfig.upsert({
    where: { id: 1 },
    update: {
      isActive,
      multiplier: isActive ? multiplier : 1.0,
      reason: isActive ? (reason ?? null) : null,
      activatedAt: isActive ? new Date() : undefined,
      deactivatedAt: !isActive ? new Date() : undefined,
    },
    create: {
      id: 1,
      isActive: isActive ?? false,
      multiplier: multiplier ?? 1.0,
      reason: reason ?? null,
    },
  });
};