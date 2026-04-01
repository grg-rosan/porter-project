// utils/getDistance.js
const getDistance = async (pick_up, drop_off) => {
    const url = `http://router.project-osrm.org/route/v1/driving/
${pick_up.lng},${pick_up.lat};${drop_off.lng},${drop_off.lat}?overview=false`

    const res  = await fetch(url)
    const data = await res.json()

    if (data.code !== "Ok") throw new Error("Could not calculate route")

    const distance_km = data.routes[0].distance / 1000  // meters → km
    const duration_min = data.routes[0].duration / 60   // seconds → min

    return { distance_km, duration_min }
}

export default getDistance;