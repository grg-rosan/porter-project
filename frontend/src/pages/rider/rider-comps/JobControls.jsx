const jobSteps = [
    { status: "arrived",   label: "Mark Arrived",   next: "arrived"   },
    { status: "picked_up", label: "Mark Picked Up", next: "picked_up" },
    { status: "delivered", label: "Mark Delivered", next: "delivered"  },
]

const JobControls = ({ status, onUpdateStatus }) => {
    const nextStep = {
        accepted:  { label: "I have Arrived",    emit: "arrived"   },
        arrived:   { label: "Order Picked Up",   emit: "picked_up" },
        picked_up: { label: "Order Delivered",   emit: "delivered" },
    }

    const current = nextStep[status]

    return (
        <div className="border rounded p-4">
            <h2 className="font-bold mb-4">Job In Progress</h2>

            {/* progress steps */}
            <div className="flex justify-between mb-6">
                {jobSteps.map(step => (
                    <div
                        key={step.status}
                        className={`text-center text-sm ${
                            status === step.status || 
                            jobSteps.findIndex(s => s.status === status) >
                            jobSteps.findIndex(s => s.status === step.status)
                                ? "text-green-500 font-bold"
                                : "text-gray-400"
                        }`}
                    >
                        {step.label}
                    </div>
                ))}
            </div>

            {current && (
                <button
                    onClick={() => onUpdateStatus(current.emit)}
                    className="w-full bg-blue-500 text-white p-3 rounded font-bold"
                >
                    {current.label}
                </button>
            )}
        </div>
    )
}

export default JobControls
