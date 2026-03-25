// DashBoard.jsx — cleaner
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLE_HOME } from '../constants/role'

const DashBoard = () => {
  const { user } = useAuth()
  return <Navigate to={ROLE_HOME[user?.role] || '/'} replace />
}

export default DashBoard