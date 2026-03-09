import { createContext, useContext, useState } from "react";

const AuthContext = createContext()

export const AuthProvider = ({children}) => {
   const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem("user")
            // ✅ check if stored value exists before parsing
            return stored && stored !== "undefined" ? JSON.parse(stored) : null
        } catch {
            localStorage.removeItem("user")  // clear bad data
            return null
        }
    })
    const login  = (userData) => {
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
    }

       const logout = () => {
        setUser(null)
        localStorage.removeItem("user")
    }

    return(
        <AuthContext.Provider value={{ user ,login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)