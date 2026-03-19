import { useEffect, useRef } from "react";
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
};

export default function TrackingMap({
  customerLocation = null,
  riderLocation    = null,
  zoom             = 15,
}) {
  const nodeRef     = useRef(null);
  const mapInst     = useRef(null);
  const customerRef = useRef(null);
  const riderRef    = useRef(null);

  useEffect(() => {
    if (!nodeRef.current || mapInst.current) return;

    const initCenter = customerLocation
      ? [customerLocation.lat, customerLocation.lng]
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
      mapInst.current = null;
      customerRef.current = null;
      riderRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

    if (!riderLocation) mapInst.current.panTo(pos);
  }, [customerLocation?.lat, customerLocation?.lng]); // ✅

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

    if (customerLocation) {
      mapInst.current.fitBounds(
        L.latLngBounds([customerLocation.lat, customerLocation.lng], pos),
        { padding: [60, 60] }
      );
    } else {
      mapInst.current.panTo(pos);
    }
  }, [riderLocation?.lat, riderLocation?.lng]); // ✅

  return <div ref={nodeRef} style={{ width: "100%", height: "100%" }} />;
}