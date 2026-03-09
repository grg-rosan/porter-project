import React, { useState } from 'react'
//27.7103° N, 85.3222° E ktm
//28.2096° N, 83.9856° pokh
const OrderFormComp = ({ onSubmit }) => {
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropAddress, setDropAddress] = useState('')
  const [weight, setWeight] = useState('');
  const [vehicleType, setVehicleType] = useState("BIKE");

const handleData = (e) => {
  e.preventDefault();

  onSubmit({
    pickup_address: pickupAddress,
    drop_address: dropAddress,
    order_weight: Number(weight),
    vehicle_type: vehicleType
  });
};
  return (
    <div>
      <h2>Create Order</h2>
      <form  onSubmit={handleData}>
        <h4>Pickup</h4>
        <input type="text" id="pickupAddress" placeholder="Pickup Address" required
          value={pickupAddress}
          onChange={e => setPickupAddress(e.target.value)} />


        <h4>Drop</h4>
        <input type="text" id="dropAddress" placeholder="Drop Address" required 
          value={dropAddress}
          onChange={e => setDropAddress(e.target.value)}
        />
    

        <h4>Order Details</h4>
        <input type="number" id="weight" placeholder="Weight (kg)" required value={weight} onChange={e => setWeight(e.target.value)}/>
        <select id="vehicleType" value={vehicleType} onChange={e => setVehicleType(e.target.value)}>
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