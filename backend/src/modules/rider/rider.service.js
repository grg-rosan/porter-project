import { prisma } from "../../config/db.config.js";
import AppError from "../../utils/AppError.js";
import { uploadBufferToCloudinary } from "../../utils/cloudinary.js";

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

  if(profile.verificationStatus === "APPROVED") throw new AppError("Doucments already verified", 400);

  const [licenseUrl, governmentIDUrl, vehicleImageUrl] = await Promise.all([
    uploadBufferToCloudinary(files.license,"rider-docs/license_image"),
    uploadBufferToCloudinary(files.license,"rider-docs/governmentID_image"),
    uploadBufferToCloudinary(files.license,"rider-docs/vehicle_image"),
  ])

  const updated = await prisma.riderProfile.update({
    where:{userID},
    data:{
      license_image: licenseUrl,
      governmentID_image:governmentIDUrl,
      vehicle_image:vehicleImageUrl,
      verificationStatus:"PENDING" 
    }
  })
  return updated;
}