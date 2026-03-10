import { prisma } from "../../config/db.config";

export const getRiderProfileService = async (riderID) => {
  const profile = await prisma.riderProfile.findUnique({
    where: { userID },
    include: {
      select: { name: true, email: true },
    },
  });

  if (!profile) throw new Error("Rider profile not found");
  return profile;
};

export const updateAvailabilityService = async (userID, isAvailable) => {
  const profile = await prisma.riderProfile.update({
    where: { userID },
    data: { isAvailable },
  });
  return profile;
};
