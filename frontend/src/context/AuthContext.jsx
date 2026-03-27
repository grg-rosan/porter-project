import { createContext, useContext, useState } from "react";
import { getAPI } from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
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
            return true;
        } catch (err) {
            setError("Something went wrong");
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
            return true;
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);