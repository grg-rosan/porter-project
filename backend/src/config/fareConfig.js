// config/fareConfig.js
const vehicleFareConfig = {
    SCOOTER: {
        base_fare:     30,   
        per_km:        15,   
        per_kg:         2,   
        min_fare:      80,   
    },
    BIKE: {
        base_fare:     40,
        per_km:        18,
        per_kg:         2.5,
        min_fare:      100,
    },
    MINI_VAN: {
        base_fare:     80,
        per_km:        25,
        per_kg:         3,
        min_fare:      150,
    },
    JEEP: {
        base_fare:     200,
        per_km:        35,
        per_kg:         5,
        min_fare:      500,
    },
}
export default vehicleFareConfig;