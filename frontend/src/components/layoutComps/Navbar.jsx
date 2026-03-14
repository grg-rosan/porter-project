import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom';
import { getAPI } from '../../api/api';

const Navbar = () => {

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const hanldeLogout = async () => {
    try {
      await getAPI("auth/logout", "POST")
    } catch (error) {
      console.log("error logging out", error.message)
    } finally {
      logout()
      navigate("/")
    }
  }
  return (
    <div>
      <strong>Welcome {user?.name}</strong>
      <button onClick={hanldeLogout}> logout</button>
    </div>
  )
}

export default Navbar