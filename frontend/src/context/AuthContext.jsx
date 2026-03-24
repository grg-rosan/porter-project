import { createContext, useContext, useState } from "react";
import { getAPI } from "../api/api";
import { useSocket } from "./SocketContext";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { connectSocket, joinAsUser } = useSocket();

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored && stored !== "undefined" ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (formData) => {
    setLoading(true);
    setError("");
    try {
      const data = await getAPI("auth/login", "POST", formData);

      if (data.status !== "success") {
        setError(data.message || "Login failed");
        return;
      }

      const userData = data.data.user;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      connectSocket(userData); // connect and pass user
      joinAsUser(userData);
    } catch (error) {
      setError("Something went wrong", error.message);
    } finally {
      setLoading(false);
    }
  };

 const register = async (formData) => {
    setLoading(true);
    setError("");
    try {
      const data = await getAPI("auth/register", "POST", formData);

      if (data.status !== "success") {
        setError(data.message || "Registration failed");
        return;
      }

      return true; // signal to AuthPage to switch to login
    } catch (error) {
      setError("Something went wrong", error.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
