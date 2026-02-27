import React, { useState } from 'react'
import LoginForm from '../components/authComps/LoginForm'
import RegisterComp from '../components/authComps/RegisterComp'
import { getAPI } from '../api/api'

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true)
    const [error, setError] = useState('')



    //handle Register
    const handleRegister = async (formData) => {
        try {
            const data = await getAPI("auth/register", 'POST',formData);
            console.log("registered:", data)
            setError('')
            setIsLogin(true)

        } catch (error) {
            console.log(error)
            setError("something went wrong")
        }
    }


    return (
        <div>
            {
                isLogin ?
                    (
                        <LoginForm
                            // onLogin = {handleLogin}
                            switchToRegister={() => setIsLogin(false)}
                            error={error} />
                    ) : (
                        <RegisterComp
                            onRegister={handleRegister}
                            switchToLogin={() => setIsLogin(true)}
                            error={error} />
                    )
            }

        </div>
    )
}

export default AuthPage