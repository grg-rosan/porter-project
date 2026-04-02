import {prisma} from "../../config/db.config.js"
import AppError from "../../utils/AppError.js"
/**
 * Get the full customer profile for the authenticated user.
 * Joins CustomerProfile + User (safe fields only — no password).
 */
export const getCustomerProfileService = async (userID) => {
  const profile = await prisma.customerProfile.findUnique({
    where: { userID },
    include: {
      user: {
        select: {
          userID: true,
          name: true,
          email: true,
          role: true,
          verificationStatus: true,
          verificationNote: true,
          governmentID: true,
          governmentID_image: true,
          isBlocked: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!profile) {
    throw new AppError("Customer profile not found", 404);
  }

  return profile;
};

/**
 * Update the customer profile for the authenticated user.
 * Merges CustomerProfile fields and User.name in a single transaction.
 */
export const updateCustomerProfileService = async (userID, data) => {
  const { name, phone, address, city, latitude, longitude } = data;

  // Run both updates atomically
  const [updatedProfile] = await prisma.$transaction([
    prisma.customerProfile.update({
      where: { userID },
      data: {
        ...(phone     !== undefined && { phone }),
        ...(address   !== undefined && { address }),
        ...(city      !== undefined && { city }),
        ...(latitude  !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
      },
      include: {
        user: {
          select: {
            userID: true,
            name: true,
            email: true,
            role: true,
            verificationStatus: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    }),
    // Only update User.name if it was provided
    ...(name !== undefined
      ? [prisma.user.update({ where: { userID }, data: { name } })]
      : []),
  ]);

  return updatedProfile;
};