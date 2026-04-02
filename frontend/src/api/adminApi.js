import { getAPI } from "./api";

const PREFIX = "admin";

// Existing Dashboard & Config
export const fetchDashboardStats = () => getAPI(`${PREFIX}/dashboard`, "GET");
export const fetchAnalytics      = () => getAPI(`${PREFIX}/analytics`, "GET");
export const fetchFareConfigs    = () => getAPI(`${PREFIX}/fare-config`, "GET");
export const updateFareConfig    = (type, data) => getAPI(`${PREFIX}/fare-config/${type}`, "PATCH", data);
export const fetchSurgeStatus    = () => getAPI(`${PREFIX}/surge`, "GET");
export const updateSurge         = (body) => getAPI(`${PREFIX}/surge`, "PATCH", body);

// Rider Verifications
export const fetchRiderVerifications = (status) => 
  getAPI(`${PREFIX}/verifications${status ? `?status=${status}` : ""}`, "GET");

export const fetchRiderDetails = (riderID) => 
  getAPI(`${PREFIX}/verifications/${riderID}`, "GET");

export const reviewRiderDocs = (riderID, status, reason) =>
  getAPI(`${PREFIX}/verifications/${riderID}/review`, "PATCH", { status, reason });

// Complaints
export const fetchComplaints = (params) => {
  const query = params?.status ? `?status=${params.status}` : "";
  return getAPI(`${PREFIX}/complaints${query}`, "GET");
};

export const resolveComplaint = (id, data) => 
  getAPI(`${PREFIX}/complaints/${id}/resolve`, "PATCH", data);

// User Management (Blocking)
export const blockUser = (userID, reason) => 
  getAPI(`${PREFIX}/users/${userID}/block`, "PATCH", { reason });

export const unblockUser = (userID) => 
  getAPI(`${PREFIX}/users/${userID}/unblock`, "PATCH");