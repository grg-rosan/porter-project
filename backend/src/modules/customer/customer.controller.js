import {
  getCustomerProfileService,
  updateCustomerProfileService,
} from "./customer.service.js";

/**
 * GET /customer/profile
 * Returns the full profile of the authenticated customer.
 */
export const getCustomerProfile = async (req, res, next) => {
  try {
    const profile = await getCustomerProfileService(req.user.userID);

    res.status(200).json({
      status: "success",
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /customer/profile
 * Allows a customer to update their own profile fields.
 * Updatable: name, phone, address, city, latitude, longitude
 */
export const updateCustomerProfile = async (req, res, next) => {
  try {
    const updatedProfile = await updateCustomerProfileService(
      req.user.userID,
      req.body
    );

    res.status(200).json({
      status: "success",
      data: { profile: updatedProfile },
    });
  } catch (error) {
    next(error);
  }
};