import { prisma } from "../../config/db.config.js";
import AppError from "../../utils/AppError.js";
import { uploadBufferToCloudinary } from "../../utils/cloudinary.js";
import cloudinary from "../../utils/cloudinary.js"

export const getRiderProfileService = async (userID) => {
  const profile = await prisma.riderProfile.findUnique({
    where: { userID },
    include: {
      user:{
        select: { name: true, email: true },
      }
    },
  });

  if (!profile) throw new AppError("Rider profile not found",404);
  return profile;
};

export const updateAvailabilityService = async (userID, isAvailable) => {
  const {isAvailable} = req.body;
  if(typeof isAvailable !== "boolean"){
    throw new AppError("isAvailable must be boolean ", 400)
  }
   const profile = await prisma.riderProfile.findUnique({ where: { userID } });
  if (!profile) throw new AppError("Rider profile not found", 404);

  const updated = await prisma.riderProfile.update({
    where: { userID },
    data: { isAvailable },
  });
  return updated;
};

  export const submitDocsService = async(userID, files) => {
    const profile = await prisma.riderProfile.findUnique({where:{userID}});

    if(!profile) throw new AppError('Rider profile not found', 400);

    if(profile.verificationStatus === "APPROVED") throw new AppError("Documents already verified", 400);

    // 1. Delete old images from Cloudinary if they exist
    const oldPublicIds = [
      profile.license_publicId,
      profile.governmentID_publicId,
      profile.vehicle_publicId
    ].filter(id => id); // Only keep IDs that aren't null/undefined

    if (oldPublicIds.length > 0) {
      // We don't necessarily need to 'await' this if we want speed, 
      // but it's cleaner to ensure they are gone.
      await Promise.all(oldPublicIds.map(id => cloudinary.uploader.destroy(id)));
    }

    const [licenseRes, governmentIDRes, vehicleImageRes] = await Promise.all([
      uploadBufferToCloudinary(files.license[0],"rider-docs/license_image"),
      uploadBufferToCloudinary(files.governmentID[0],"rider-docs/governmentID_image"),
      uploadBufferToCloudinary(files.vehicle_image[0],"rider-docs/vehicle_image"),
    ])

    const updated = await prisma.riderProfile.update({
      where:{userID},
      data:{
        license_image: licenseRes.secure_url,
        license_publicId: licenseRes.public_id,
        governmentID_image:governmentIDRes.secure_url,
        governmentID_publicId: govIdRes.public_id,
        vehicle_image:vehicleImageRes.secure_url,
        vehicle_publicId: vehicleRes.public_id,
        verificationStatus:"PENDING" 
      }
    })
    return updated;
  }