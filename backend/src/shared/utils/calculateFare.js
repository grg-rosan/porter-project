import vehicleFareConfig from "../../config/fareConfig.js"
const calculateFare = ({ distance_km, weight_kg, vehicle_type, duration_min }) => {
    const config = vehicleFareConfig[vehicle_type]
    if (!config) throw new Error("Invalid vehicle type")

    const distance_charge = distance_km  * config.per_km
    const weight_charge   = weight_kg    * config.per_kg
    const raw_fare        = config.base_fare + distance_charge + weight_charge

    // surge: 1.3x if over 10km (city2city long haul)
    const surge_multiplier = distance_km > 10 ? 1.3 : 1.0

    const final_fare = Math.max(
        Math.round(raw_fare * surge_multiplier),
        config.min_fare
    )

    return {
        fare:          final_fare,
        breakdown: {
            base:      config.base_fare,
            distance:  Math.round(distance_charge),
            weight:    Math.round(weight_charge),
            surge:     surge_multiplier > 1 ? "30%" : null,
        },
        distance_km:   Math.round(distance_km  * 10) / 10,  // 1 decimal
        eta_min:       Math.round(duration_min),
    }
}

export default calculateFare