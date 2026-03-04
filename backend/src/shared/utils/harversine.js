// pickupLoc = { lat: number, lng: number }
// dropLoc = { lat: number, lng: number }

export function haversine(pickupLoc, dropLoc) {
  const R = 6371; // Earth radius in km

  const dLat = (dropLoc.lat - pickupLoc.lat) * (Math.PI / 180);
  const dLng = (dropLoc.lng - pickupLoc.lng) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(pickupLoc.lat * (Math.PI / 180)) *
      Math.cos(dropLoc.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in km
}
