const OrderCard = ({ order, onAccept, onReject }) => {
    return (
        <div className="border rounded p-4 shadow">
            <h2 className="font-bold text-lg mb-2">🔔 New Order!</h2>

            <div className="mb-4 space-y-1">
                <p>📦 Order ID: {order.orderID}</p>
                <p>📍 Pickup: {order.pickup}</p>
                <p>💰 Amount: Rs. {order.amount}</p>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={onAccept}
                    className="flex-1 bg-green-500 text-white p-2 rounded"
                >
                    Accept
                </button>
                <button
                    onClick={onReject}
                    className="flex-1 bg-red-500 text-white p-2 rounded"
                >
                    Reject
                </button>
            </div>
        </div>
    )
}

export default OrderCard