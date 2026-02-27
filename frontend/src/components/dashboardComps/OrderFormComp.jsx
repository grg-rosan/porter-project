import React from 'react'
//27.7103° N, 85.3222° E ktm
//28.2096° N, 83.9856° pokh
const OrderFormComp = () => {
  return (
    <div>
      <h2>Create Order</h2>
      <form action="#">
        <h4>Pickup</h4>
        <input type="text" id="pickupAddress" placeholder="Pickup Address" required />
        <input type="number" step="any" id="pickupLat" placeholder="Pickup Lat" required />
        <input type="number" step="any" id="pickupLng" placeholder="Pickup Lng" required />

        <h4>Drop</h4>
        <input type="text" id="dropAddress" placeholder="Drop Address" required />
        <input type="number" step="any" id="dropLat" placeholder="Drop Lat" required />
        <input type="number" step="any" id="dropLng" placeholder="Drop Lng" required />

        <h4>Order Details</h4>
        <input type="number" id="weight" placeholder="Weight (kg)" required />
        <select id="vehicleType">
          <option value="BIKE">Bike</option>
          <option value="SCOOTER">Scooter</option>
          <option value="VAN">Van</option>
        </select>

        <br></br>
          <button type="submit">Create Order</button>
          </form>
        </div>
  )
}

export default OrderFormComp