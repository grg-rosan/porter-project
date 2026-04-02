import { getAPI, uploadAPI } from "./api.js";

const PREFIX = "rider";

export const getRiderProfile = () => 
  getAPI(`${PREFIX}/profile`, "GET");

export const uploadRiderDocuments = (formData) => 
  uploadAPI(`${PREFIX}/upload-docs`, formData);