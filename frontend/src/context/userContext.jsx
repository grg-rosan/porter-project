import { createContext, useContext, useState, useEffect,useCallback } from "react";
import { getAPI } from "../api/api";
import { useAuth } from "./AuthContext";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const { user } = useAuth(); // knows if logged in + role

    const [profile, setProfile] = useState(null);
    const [isVerified, setIsVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

   const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
        const endpoint = user.role === "rider" ? "rider/profile" : "customer/profile";
        const data = await getAPI(endpoint, "GET");
        if (data.status === "success") {
            setProfile(data.data);
            setIsVerified(data.data.isVerified ?? false);
        }
    } catch (err) {
        setError("Failed to fetch profile");
    } finally {
        setLoading(false);
    }
}, [user]); // re-creates only when user changes

useEffect(() => {
    if (!user) {
        setProfile(null);
        setIsVerified(false);
        return;
    }
    fetchProfile();
}, [user,fetchProfile]); // safe now — fetchProfile is stable

    const updateProfile = async (formData) => {
        setLoading(true);
        try {
            const endpoint = user.role === "rider" ? "rider/profile" : "customer/profile";
            const data = await getAPI(endpoint, "PATCH", formData);
            if (data.status === "success") {
                setProfile(data.data);
                return true;
            }
        } catch (err) {
            setError("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserContext.Provider value={{ profile, isVerified, loading, error, fetchProfile, updateProfile }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);