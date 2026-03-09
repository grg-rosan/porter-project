import { io } from "../../server.js"

const notifyRider = async (message) => {
    const { orderID, pickup_address, total_amount, customerID, vehicle_type } = message

    // ✅ emit only to matching vehicle type
    const vehicleRoom = `riders:${vehicle_type}`  // e.g. "riders:BIKE"

    io.to(vehicleRoom).emit("order:new", {
        orderID,
        pickup: pickup_address,
        amount: total_amount,
        customerID,
        vehicle_type
    })

    console.log(`🔔 Notified room: ${vehicleRoom}`)
}

export default notifyRider
// ```

// ---

// ## Room Structure Now
// ```
// user:123          ← personal room (every user)
// online_riders     ← all available riders
// riders:BIKE       ← only bike riders      ← order notifications go here
// riders:SCOOTER    ← only scooter riders
// riders:VAN        ← only van riders
// riders:MINI_TRUCK ← only mini truck riders
// order:abc         ← active job room
// ```

// ---

// ## Full Flow
// ```
// Customer selects BIKE → creates order
//         ↓
// RabbitMQ message { vehicle_type: "BIKE" }
//         ↓
// notification.service → io.to("riders:BIKE").emit("order:new")
//         ↓
// Only BIKE riders receive notification ✅
// VAN / SCOOTER riders get nothing ✅
//         ↓
// Rider accepts → leaves "riders:BIKE" room
//         ↓
// Other BIKE riders still get new orders ✅
//         ↓
// Rider delivers → rejoins "riders:BIKE" room ✅