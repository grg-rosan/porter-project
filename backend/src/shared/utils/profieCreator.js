import { prisma } from "../../config/db.config.js";

const createCustomerProfile = async (userID, data) => {
  return await prisma.customerProfile.create({
    data: {
      userID,
      address: data.address || "",
    },
  });
};

const createRiderProfile = async (userID, data) => {
  return await prisma.riderProfile.create({
    data: {
      userID,
      vehicle_type: "BIKE",
      available_status: true,
      location: data.location || "",
    },
  });
};

export { createCustomerProfile, createRiderProfile };
