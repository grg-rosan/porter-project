import React, { useState } from "react";

const RegisterForm = ({ onRegister, switchToLogin, error }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CUSTOMER"); // default role
  const [vehicleType, setVehicleType] = useState("SCOOTER");
  const [licenseNumber, setLicenseNumber] = useState("");

  const isRoleRider = role === "RIDER";

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister({
      name,
      email,
      password,
      role,
      ...(role === "RIDER" && { vehicleType, licenseNumber }),
    }); // pass all fields as an object
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 bg-white shadow-md rounded-2xl p-8 w-80"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Register</h2>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          <option value="CUSTOMER">Customer</option>
          <option value="ADMIN">Admin</option>
          <option value="RIDER">Rider</option>
        </select>

        {isRoleRider && (
          <>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="SCOOTER">Scooter</option>
              <option value="BIKE">Bike</option>
              <option value="VAN">Van</option>
              <option value="MINI_TRUCK">Mini Truck</option>
            </select>

            <input
              type="text"
              placeholder="License Number"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </>
        )}

        <button
          type="submit"
          className="w-full mt-2 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-semibold py-2 rounded-lg transition-colors duration-200"
        >
          Register
        </button>

        <p className="text-sm text-gray-500 text-center mt-1">
          Already have an account?{" "}
          <span
            onClick={switchToLogin}
            className="text-sky-500 hover:text-sky-700 font-medium cursor-pointer underline"
          >
            Login
          </span>
        </p>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </div>
  );
};

export default RegisterForm;
