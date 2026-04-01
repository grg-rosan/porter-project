import multer from "multer";
import AppError from "../utils/AppError.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "application/pdf"];
  if(allowed.includes(file.mimetype)){
    cb(null, true)
  }else{
    cb(new AppError("only jpeg, png and pdf files are allowed ", 400), false)
  }
};

export const uploadRiderDocs = multer({
    storage, fileFilter, limits:{fileSize: 5*1024* 1024}
}).fields([
  {name:"license", maxCount:1},
  {name:"governmentID", maxCount:1},
  {name:"vehicle_img", maxCount:1},
])
