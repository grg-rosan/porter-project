import React, { useState } from "react";
const LoginForm = ({ onLogin, switchToRegister, error }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ email, password });
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-3 bg-white shadow-md rounded-2xl p-8 w-80"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Login</h2>

        <label
          htmlFor="email"
          className="self-start text-sm font-medium text-gray-600"
        >
          Email
        </label>
        <input
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          type="email"
          placeholder="Enter email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label
          htmlFor="password"
          className="self-start text-sm font-medium text-gray-600"
        >
          Password
        </label>
        <input
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          type="password"
          placeholder="Enter password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full mt-2 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-semibold py-2 rounded-lg transition-colors duration-200"
        >
          Login
        </button>

        <p className="text-sm text-gray-500 mt-1">
          Don't have an account?{" "}
          <span
            onClick={switchToRegister}
            className="text-sky-500 hover:text-sky-700 font-medium cursor-pointer underline"
          >
            Register
          </span>
        </p>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </div>
  );
};

export default LoginForm;
