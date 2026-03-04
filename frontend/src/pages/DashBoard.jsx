import React, { useState } from "react";
import OrderFormComp from "../components/dashboardComps/OrderFormComp";
import Map from "../components/dashboardComps/MapComp";
import { getAPI } from "../api/api";



const DashBoard = () => {
  const [isOrder, setIsOrder] = useState(false);
  const [error, setError] = useState('')

  const toggle_create_order = () => {
    setIsOrder((toggle) => !toggle);
  };

  const handle_order = async (orderData) => {
    try {
      const data = await getAPI("customer/create-order", "POST", orderData)
      setError('')
      if(!data.status){
        setError(data.message || "order creation failed")
        return;
      }
      console.log("order-creation successful",data);
    } catch (error) {
      console.log(error)
      setError("something went wrong")
    }
  };
  return (
    <div>
      <Map />
      <button onClick={toggle_create_order}>Create Order</button>
      {isOrder && (
        <OrderFormComp onOrder={handle_order} />
      )}
    </div>
  );
};

export default DashBoard;
//api/customer/create-order