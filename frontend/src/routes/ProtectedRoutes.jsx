import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ allowedRole }) => {
    const { user } = useAuth()

    if (!user) return <Navigate to="/" replace />

    if (allowedRole && user.role !== allowedRole) {
        return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
}

export default ProtectedRoute