import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLE_HOME } from '../constants/role'
import { SocketProvider } from '../context/SocketContext'

const ProtectedRoute = ({ allowedRole }) => {
    const { user } = useAuth()

    if (!user) return <Navigate to="/" replace />

    if (allowedRole && user.role !== allowedRole) {
        return <Navigate to={ROLE_HOME[user.role]} replace />
    }

    return(
        <SocketProvider>
            <Outlet />
        </SocketProvider>
    )
}

export default ProtectedRoute