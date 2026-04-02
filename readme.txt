// services/adminApi.js  –  thin wrapper around every admin endpoint
const BASE = "/api/v1/admin";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const req = async (method, path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: authHeaders(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? "Request failed");
  return json;
};

// ── Dashboard / Analytics ────────────────────────────────────────────────────
export const fetchDashboardStats = () => req("GET", "/dashboard");
export const fetchAnalytics      = () => req("GET", "/analytics");

// ── Rider verification ───────────────────────────────────────────────────────
export const fetchRiderVerifications = (status) =>
  req("GET", `/verifications${status ? `?status=${status}` : ""}`);

export const fetchRiderDetails = (riderID) =>
  req("GET", `/verifications/${riderID}`);

export const reviewRiderDocs = (riderID, status, reason) =>
  req("PATCH", `/verifications/${riderID}/review`, { status, reason });

// ── Complaints ───────────────────────────────────────────────────────────────
export const fetchComplaints = ({ status, page = 1, limit = 20 } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (status) params.set("status", status);
  return req("GET", `/complaints?${params}`);
};

export const resolveComplaint = (id, body) =>
  req("PATCH", `/complaints/${id}/resolve`, body);

// ── User management ──────────────────────────────────────────────────────────
export const blockUser   = (userID, reason) => req("PATCH", `/users/${userID}/block`,   { reason });
export const unblockUser = (userID)         => req("PATCH", `/users/${userID}/unblock`, {});

// ── Fare config ──────────────────────────────────────────────────────────────
export const fetchFareConfigs    = ()                    => req("GET",   "/fare-config");
export const updateFareConfig    = (vehicleType, data)   => req("PATCH", `/fare-config/${vehicleType}`, data);

// ── Surge ────────────────────────────────────────────────────────────────────
export const fetchSurgeStatus = ()     => req("GET",   "/surge");
export const updateSurge      = (body) => req("PATCH", "/surge", body);