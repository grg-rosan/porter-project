import { useEffect, useLayoutEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const makeIcon = (color, iconName) => L.divIcon({
  html: `<div style="width:36px;height:36px;border-radius:50%;background:${color};
           display:flex;align-items:center;justify-content:center;
           box-shadow:0 2px 8px ${color}88;">
           <span class="material-symbols-rounded" style="color:#fff;font-size:18px;line-height:1">${iconName}</span>
         </div>`,
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const ICONS = {
  customer: makeIcon("#3B82F6", "person_pin"),
  rider:    makeIcon("#FF5722", "two_wheeler"),
  pickup:   makeIcon("#22C55E", "upload"),
  drop:     makeIcon("#EF4444", "download"),
};

export default function TrackingMap({
  customerLocation = null,
  riderLocation    = null,
  pickupLocation   = null,
  dropLocation     = null,
  zoom             = 15,
}) {
  const nodeRef     = useRef(null);
  const mapInst     = useRef(null);
  const customerRef = useRef(null);
  const riderRef    = useRef(null);
  const pickupRef   = useRef(null);
  const dropRef     = useRef(null);
  const didFitRef   = useRef(false);

  const customerLocRef = useRef(customerLocation);
  const riderLocRef    = useRef(riderLocation);
  const pickupLocRef   = useRef(pickupLocation);
  const dropLocRef     = useRef(dropLocation);

  // ✅ sync refs after render, before effects
  useLayoutEffect(() => {
    customerLocRef.current = customerLocation;
    riderLocRef.current    = riderLocation;
    pickupLocRef.current   = pickupLocation;
    dropLocRef.current     = dropLocation;
  });

  // ── init map ──────────────────────────────────────────────────
  useEffect(() => {
    if (!nodeRef.current || mapInst.current) return;

    const initCenter = customerLocRef.current
      ? [customerLocRef.current.lat, customerLocRef.current.lng]
      : [27.7172, 85.3240];

    mapInst.current = L.map(nodeRef.current, {
      center: initCenter,
      zoom,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(mapInst.current);

    setTimeout(() => mapInst.current?.invalidateSize(), 200);

    return () => {
      mapInst.current?.remove();
      mapInst.current     = null;
      customerRef.current = null;
      riderRef.current    = null;
      pickupRef.current   = null;
      dropRef.current     = null;
      didFitRef.current   = false;
    };
  }, [zoom]);

  // ── customer marker ───────────────────────────────────────────
  useEffect(() => {
    if (!mapInst.current || !customerLocation) return;
    const pos = [customerLocation.lat, customerLocation.lng];

    if (!customerRef.current) {
      customerRef.current = L.marker(pos, { icon: ICONS.customer })
        .bindPopup("📍 You")
        .addTo(mapInst.current);
    } else {
      customerRef.current.setLatLng(pos);
    }

    if (!riderLocRef.current) mapInst.current.panTo(pos);
  }, [customerLocation]);

  // ── rider marker ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapInst.current || !riderLocation) return;
    const pos = [riderLocation.lat, riderLocation.lng];

    if (!riderRef.current) {
      riderRef.current = L.marker(pos, { icon: ICONS.rider })
        .bindPopup("🛵 Rider")
        .addTo(mapInst.current);
    } else {
      riderRef.current.setLatLng(pos);
    }

    const customer = customerLocRef.current;
    if (customer) {
      mapInst.current.fitBounds(
        L.latLngBounds([customer.lat, customer.lng], pos),
        { padding: [60, 60] }
      );
    } else {
      mapInst.current.panTo(pos);
    }
  }, [riderLocation]);

  // ── pickup marker ─────────────────────────────────────────────
  useEffect(() => {
    if (!mapInst.current || !pickupLocation) return;
    const pos = [pickupLocation.lat, pickupLocation.lng];

    if (!pickupRef.current) {
      pickupRef.current = L.marker(pos, { icon: ICONS.pickup })
        .bindPopup(`🟢 Pickup: ${pickupLocation.displayName ?? "Pickup"}`)
        .addTo(mapInst.current);
    } else {
      pickupRef.current.setLatLng(pos);
    }
  }, [pickupLocation]);

  // ── drop marker ───────────────────────────────────────────────
  useEffect(() => {
    if (!mapInst.current || !dropLocation) return;
    const pos = [dropLocation.lat, dropLocation.lng];

    if (!dropRef.current) {
      dropRef.current = L.marker(pos, { icon: ICONS.drop })
        .bindPopup(`🔴 Drop: ${dropLocation.displayName ?? "Dropoff"}`)
        .addTo(mapInst.current);
    } else {
      dropRef.current.setLatLng(pos);
    }
  }, [dropLocation]);

  // ── fit all markers once when order is placed ─────────────────
  useEffect(() => {
    if (!mapInst.current || !pickupLocation || !dropLocation) return;
    if (didFitRef.current) return;

    const points = [
      [pickupLocation.lat, pickupLocation.lng],
      [dropLocation.lat,   dropLocation.lng],
    ];

    const customer = customerLocRef.current;
    if (customer) points.push([customer.lat, customer.lng]);

    mapInst.current.fitBounds(L.latLngBounds(points), { padding: [60, 60] });
    didFitRef.current = true;
  }, [pickupLocation, dropLocation]);

  return <div ref={nodeRef} style={{ width: "100%", height: "100%" }} />;
}