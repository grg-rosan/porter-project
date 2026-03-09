// DashBoard.jsx — redirect based on role
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const DashBoard = () => {
    const { user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (user?.role === 'customer') navigate('/customer', { replace: true })
        if (user?.role === 'rider') navigate('/rider', { replace: true })
    }, [user, navigate])

    return <div>Redirecting...</div>
}

export default DashBoard
// ```

// ---

// ## Flow
// ```
// login → data.user.role = 'customer'
//     ↓
// navigate('/dashboard')
//     ↓
// Dashboard sees role → navigate('/customer')
//     ↓
// ProtectedRoute checks role === 'customer' ✅
//     ↓
// CustomerPage renders