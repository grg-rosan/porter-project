const statusConfig = {
    pending:   { label: "Finding a rider...",       color: "bg-yellow-400" },
    accepted:  { label: "Rider accepted!",          color: "bg-blue-400"   },
    arrived:   { label: "Rider has arrived",        color: "bg-purple-400" },
    picked_up: { label: "Order picked up",          color: "bg-orange-400" },
    delivered: { label: "Order delivered!",         color: "bg-green-400"  },
    cancelled: { label: "Order cancelled",          color: "bg-red-400"    },
}

const OrderStatus = ({ status }) => {
    const config = statusConfig[status] || { label: status, color: "bg-gray-400" }

    return (
        <div className={`${config.color} text-white p-3 rounded mb-4 text-center`}>
            <p className="font-bold">{config.label}</p>
        </div>
    )
}

export default OrderStatus