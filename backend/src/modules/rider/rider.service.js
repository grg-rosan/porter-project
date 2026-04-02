import { prisma } from "../../config/db.config.js";
import AppError from "../../utils/AppError.js";
import {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} from "../../utils/cloudinary.js";

export const getRiderProfileService = async (userID) => {
  const profile = await prisma.riderProfile.findUnique({
    where: { userID },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

  if (!profile) throw new AppError("Rider profile not found", 404);
  return profile;
};

// ─── FIX: guard against going available while unverified ──────────────────────
export const updateAvailabilityService = async (userID, isAvailable) => {
  if (typeof isAvailable !== "boolean") {
    throw new AppError("isAvailable must be a boolean", 400);
  }

  const profile = await prisma.riderProfile.findUnique({ where: { userID } });
  if (!profile) throw new AppError("Rider profile not found", 404);

  // A rider can only go online once verified
  if (isAvailable && profile.verificationStatus !== "VERIFIED") {
    throw new AppError(
      "Your documents must be verified before you can go online",
      403
    );
  }

  const updated = await prisma.riderProfile.update({
    where: { userID },
    data: { isAvailable },
  });
  return updated;
};

// ─── NEW: update editable profile fields ──────────────────────────────────────
export const updateRiderProfileService = async (userID, data, file) => {
  const {
    phone,
    vehicle_number,
    vehicle_model,
    vehicle_type,
    name, // lives on User, not RiderProfile
  } = data;

  // If a new profile image was uploaded, swap it out on Cloudinary
  let profileImageUpdate = {};
  if (file) {
    const profile = await prisma.riderProfile.findUnique({ where: { userID } });
    if (!profile) throw new AppError("Rider profile not found", 404);

    if (profile.profileImage_publicId) {
      await deleteFromCloudinary(profile.profileImage_publicId);
    }

    const uploaded = await uploadBufferToCloudinary(
      file,
      "rider-profiles/profile_image"
    );
    profileImageUpdate = {
      profileImage: uploaded.secure_url,
      profileImage_publicId: uploaded.public_id,
    };
  }

  // Run both DB writes atomically
  const [updatedProfile] = await prisma.$transaction([
    prisma.riderProfile.update({
      where: { userID },
      data: {
        ...(phone          !== undefined && { phone }),
        ...(vehicle_number !== undefined && { vehicle_number }),
        ...(vehicle_model  !== undefined && { vehicle_model }),
        ...(vehicle_type   !== undefined && { vehicle_type }),
        ...profileImageUpdate,
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    // Only touch User.name if it was sent
    ...(name !== undefined
      ? [prisma.user.update({ where: { userID }, data: { name } })]
      : []),
  ]);

  return updatedProfile;
};

// ─── FIX: "VERIFIED" not "APPROVED" + correct field mapping ───────────────────
export const submitDocsService = async (userID, files) => {
  const profile = await prisma.riderProfile.findUnique({ where: { userID } });
  if (!profile) throw new AppError("Rider profile not found", 404);

  // FIX: schema enum is VERIFIED, not APPROVED
  if (profile.verificationStatus === "VERIFIED") {
    throw new AppError("Documents already verified", 400);
  }

  // Delete old Cloudinary assets if they exist
  const oldPublicIds = [
    profile.license_publicId,
    profile.governmentID_publicId,
    profile.vehicle_publicId,
  ].filter(Boolean);

  if (oldPublicIds.length > 0) {
    await Promise.all(oldPublicIds.map((id) => deleteFromCloudinary(id)));
  }

  // Upload all three in parallel
  const [licenseRes, govRes, vehicleRes] = await Promise.all([
    uploadBufferToCloudinary(files.license[0], "rider-docs/license_image"),
    uploadBufferToCloudinary(
      files.governmentID[0],
      "rider-docs/governmentID_image"
    ),
    uploadBufferToCloudinary(files.vehicle_img[0], "rider-docs/vehicle_image"),
  ]);

  const updated = await prisma.riderProfile.update({
    where: { userID },
    data: {
      license_image:        licenseRes.secure_url,
      license_publicId:     licenseRes.public_id,
      governmentID_image:   govRes.secure_url,
      governmentID_publicId: govRes.public_id,
      vehicle_image:        vehicleRes.secure_url,
      vehicle_publicId:     vehicleRes.public_id,
      verificationStatus:   "PENDING",
    },
  });

  return updated;
};