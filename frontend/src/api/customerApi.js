import { getAPI } from "./api.js";

const PREFIX = "customer";

export const getCustomerProfile = () => 
  getAPI(`${PREFIX}/profile`, "GET");

export const updateCustomerProfile = (data) => 
  getAPI(`${PREFIX}/profile`, "PATCH", data);