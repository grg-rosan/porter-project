import { useEffect, useState } from "react";

export const useGetCoords = () => {
  const [coords, setCoords] = useState([28.2096, 83.9856]); // default location

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords([lat, lng]);
        console.log("User coords:", lat, lng);
      },
      (err) => console.error(err)
    );
  }, []);

  return coords; 
};