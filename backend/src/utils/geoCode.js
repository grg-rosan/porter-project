// utils/geocode.js
import axios from "axios";

const HEADERS = {
  "User-Agent": "PorterDeliveryApp/1.0 (gurung.rosan01@gmail.com)",
  "Accept-Language": "en",
};

export const geoCode = async (address) => {
  const response = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: { q: address, format: "json", addressdetails: 1, limit: 1 },
      headers: HEADERS,
    }
  );

  if (!response.data.length) throw new Error("Location not found");

  const result = response.data[0];
  return {
    lat:         parseFloat(result.lat),
    lng:         parseFloat(result.lon),
    displayName: result.display_name,
    address:     result.address,
  };
};

export const reverseGeoCode = async (lat, lng) => {
  const response = await axios.get(
    "https://nominatim.openstreetmap.org/reverse",
    {
      params: { lat, lon: lng, format: "json", addressdetails: 1 },
      headers: HEADERS,
    }
  );

  return {
    displayName: response.data.display_name,
    address:     response.data.address,
  };
};