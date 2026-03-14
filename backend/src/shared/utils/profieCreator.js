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
  console.log(data.licenseNumber)
    return await prisma.riderProfile.create({
        data: {
            userID,
            vehicle_type: data.vehicle_type || "BIKE",  // ✅ use form data
            license_number: data.licenseNumber,         // ✅ add this (required)
            vehicle_number: data.vehicle_number || null, // optional
            phone: data.phone || null,                   // optional
            isAvailable: false
        }
    })
}
export { createCustomerProfile, createRiderProfile };
