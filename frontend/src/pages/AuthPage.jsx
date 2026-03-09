import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginForm from '../components/authComps/LoginForm'
import RegisterComp from '../components/authComps/RegisterComp'
import { getAPI } from '../api/api'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'

const AuthPage = () => {

    const navigate = useNavigate()
    const { connectSocket } = useSocket()
    const { login, user } = useAuth()
    const [isLogin, setIsLogin] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (user?.role) {
            navigate("/dashboard")
        }
    }, [user, navigate])


    //handle Register
    const handleRegister = async (formData) => {
          console.log("sending to backend:", formData)
        try {
            const data = await getAPI("auth/register", 'POST', formData);
            console.log("registered:", data)
            setError('')
            setIsLogin(true)

        } catch (error) {
            console.log(error)
            setError("something went wrong")
        }
    }
    //handle login

    const handleLogin = async (formData) => {
        console.log(formData)
        try {
            const data = await getAPI("auth/login", 'POST', formData);
            setError('');
            if (data.status !== "success") {
                setError(data.message || "login failed");
                return;
            }
            login(data.data.user)
            console.log("login successful:", data)
            connectSocket()

        } catch (error) {
            console.log(error);
            setError("something went wrong")
        }

    }
    // const handleLogout = async () => {
    //     await getAPI("auth/logout", 'POST')  // server clears cookie
    //     logout()                             // clears localStorage
    //     // disconnectSocket()
    //     navigate('/')
    // }

    return (
        <div>
            {
                isLogin ?
                    (
                        <LoginForm
                            onLogin={handleLogin}
                            switchToRegister={() => { setIsLogin(false); setError('') }}
                            error={error} />
                    ) : (
                        <RegisterComp
                            onRegister={handleRegister}
                            switchToLogin={() => { setIsLogin(true); setError('') }}
                            error={error} />
                    )
            }

        </div>
    )
}

export default AuthPage