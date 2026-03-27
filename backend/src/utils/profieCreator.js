const createCustomerProfile = async (tx, userID, data) => {
    return await tx.customerProfile.create({
        data: {
            userID,
            address: data.address || null,
        },
    });
};

const createRiderProfile = async (tx, userID, data) => {
    return await tx.riderProfile.create({
        data: {
            userID,
            vehicle_type:   data.vehicle_type   || "BIKE",
            license_number: data.licenseNumber,
            vehicle_number: data.vehicle_number || null,
            phone:          data.phone          || null,
            isAvailable:    false,
        },
    });
};

export { createCustomerProfile, createRiderProfile };