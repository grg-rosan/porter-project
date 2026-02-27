import React, { useState } from 'react';

const RegisterForm = ({ onRegister, switchToLogin, error }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER'); // default role
  const [vehicleType, setVehicleType] = useState("SCOOTER");
  const [licenseNumber, setLicenseNumber] = useState("");

  const isRoleRider = role === "RIDER";

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister({ name, email, password, role, ...(role === "RIDER" && { vehicleType, licenseNumber }) }); // pass all fields as an object
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <select value={role} onChange={(e) => setRole(e.target.value)} required>
        <option value="CUSTOMER">Customer</option>
        <option value="ADMIN">Admin</option>
        <option value="RIDER">Rider</option>
      </select>
      {isRoleRider && (
        <>
         <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value) }required >
          <option value="SCOOTER" >Scooter</option>
          <option value="BIKE" >Bike</option>
          <option value="VAN" >Van</option>
          <option value="MINI_TRUCK" >Mini Truck</option>
         </select>

          <input
            type="text"
            placeholder="License Number"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
          />
        </>
      )}

      <button type="submit">Register</button>

      <p onClick={switchToLogin} style={{ cursor: 'pointer', marginTop: '10px' }}>
        Already have an account? Login
      </p>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default RegisterForm;