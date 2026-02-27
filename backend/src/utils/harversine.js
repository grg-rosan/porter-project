// pickup_address = { lat: number, lng: number }
// drop_address = { lat: number, lng: number }

export function haversine(pickup_address, drop_address) {
  const R = 6371; // Earth radius in km

  const dLat = (drop_address.lat - pickup_address.lat) * (Math.PI / 180);
  const dLng = (drop_address.lng - pickup_address.lng) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(pickup_address.lat * (Math.PI / 180)) *
      Math.cos(drop_address.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in km
}
